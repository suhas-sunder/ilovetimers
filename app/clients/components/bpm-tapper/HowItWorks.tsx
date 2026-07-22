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


  const Kbd = ({ children }: { children: React.ReactNode }) => (
    <kbd className="ilt-keycap px-2 py-1 font-mono text-[11px] font-semibold text-[var(--ilt-text-primary)]">
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
      className="cursor-pointer ilt-inline-pill px-3 py-1.5 text-sm font-semibold text-[var(--ilt-text-primary)] transition hover:bg-[var(--ilt-bg-hover)]"
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
    <div className="ilt-surface-card p-5">
      <div className="text-base font-semibold text-[var(--ilt-text-primary)]">{title}</div>
      {subtitle ? (
        <div className="mt-1 text-sm text-[var(--ilt-text-muted)]">{subtitle}</div>
      ) : null}
      <div className="mt-3 ilt-surface-muted p-4">
        <div className="font-mono text-xs whitespace-pre-wrap text-[var(--ilt-text-secondary)]">
          {lines.join("\n")}
        </div>
      </div>
    </div>
  );

  return (
    <section className="mx-auto max-w-7xl px-4 pb-10">

      <div className="ilt-surface-card p-6">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h2 className="text-xl font-semibold text-[var(--ilt-text-primary)]">How it works</h2>

            <p className="mt-2 max-w-3xl text-[var(--ilt-text-secondary)] leading-relaxed">
              Tap BPM is a fast, no-setup tempo checker. You tap the beat, the
              page estimates beats per minute, and you can lock or copy the
              result when it feels right. It’s built for real usage: checking a
              song’s tempo by feel, matching a loop, picking a metronome value,
              or sanity-checking timing in milliseconds per beat.
            </p>

            <p className="mt-3 max-w-3xl text-[var(--ilt-text-secondary)] leading-relaxed">
              This page is not a tutorial about music theory. The goal is
              practical: estimate BPM from taps, avoid accidental pauses
              messing up the number, and keep the result visible long enough to
              use it. If you want audible clicks at a fixed tempo, use{" "}
              <a
                className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
                href={abs("/metronome")}
              >
                Metronome
              </a>
              . If you want plain timing instead of tempo, use{" "}
              <a
                className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
                href={abs("/stopwatch")}
              >
                Stopwatch
              </a>{" "}
              or{" "}
              <a
                className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
                href={abs("/countdown-timer")}
              >
                Countdown Timer
              </a>
              .
            </p>
          </div>

          <div className="flex flex-wrap gap-2 sm:justify-end">
            <span className="ilt-inline-pill px-3 py-1 text-xs font-semibold text-[var(--ilt-text-secondary)]">
              Tap anywhere
            </span>
            <span className="ilt-inline-pill px-3 py-1 text-xs font-semibold text-[var(--ilt-text-secondary)]">
              Auto-reset
            </span>
            <span className="ilt-inline-pill px-3 py-1 text-xs font-semibold text-[var(--ilt-text-secondary)]">
              Hold + lock
            </span>
            <span className="ilt-inline-pill px-3 py-1 text-xs font-semibold text-[var(--ilt-text-secondary)]">
              ms/beat
            </span>
            <span className="ilt-inline-pill px-3 py-1 text-xs font-semibold text-[var(--ilt-text-secondary)]">
              Fullscreen
            </span>
            <span className="ilt-inline-pill px-3 py-1 text-xs font-semibold text-[var(--ilt-text-secondary)]">
              Copy result
            </span>
          </div>
        </div>

        {/* Quick flow */}
        <div className="mt-6 grid gap-4 lg:grid-cols-[1.12fr_0.88fr]">
          <div className="ilt-surface-muted p-5">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              Fast start (what most people want)
            </div>

            <ol className="mt-3 space-y-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              <li>
                <span className="font-semibold text-[var(--ilt-text-primary)]">1)</span> Tap a
                steady beat anywhere on the tap area. Aim for at least{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">6–10 taps</span>{" "}
                if you want the number to settle.
              </li>
              <li>
                <span className="font-semibold text-[var(--ilt-text-primary)]">2)</span> Watch
                the BPM stabilize. The page shows{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">ms/beat</span>{" "}
                and quick references for 8ths and 16ths.
              </li>
              <li>
                <span className="font-semibold text-[var(--ilt-text-primary)]">3)</span> Press{" "}
                <Kbd>C</Kbd> to copy, or use{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">Lock</span> to
                freeze the result on screen.
              </li>
              <li>
                <span className="font-semibold text-[var(--ilt-text-primary)]">4)</span> If you
                pause, the tool auto-ends the session after{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">Reset</span>.
                After that, it holds the last result for{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">Hold</span> (or
                clears immediately if Hold is off).
              </li>
              <li>
                <span className="font-semibold text-[var(--ilt-text-primary)]">5)</span> For
                distance viewing, press <Kbd>F</Kbd> for fullscreen. Press{" "}
                <Kbd>Esc</Kbd> to exit.
              </li>
            </ol>

            <div className="mt-4 ilt-surface-card p-4">
              <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
                What “Reset”, “Hold”, and “Lock” actually do
              </div>
              <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
                <span className="font-semibold text-[var(--ilt-text-primary)]">Reset</span>{" "}
                controls how long you can pause before the tap session ends. If
                you stop tapping longer than Reset, the tool stops listening for
                beats and treats the current BPM as the last result.
              </p>
              <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
                <span className="font-semibold text-[var(--ilt-text-primary)]">Hold</span>{" "}
                controls how long that last result stays visible after the
                session ends. This is for normal workflow: glance, copy, lock,
                or start again.
              </p>
              <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
                <span className="font-semibold text-[var(--ilt-text-primary)]">Lock</span>{" "}
                freezes the result and disables tapping until you unlock. Use it
                when you want a stable number on screen without worrying about
                accidental clicks or auto-clear.
              </p>
            </div>
          </div>

          <div className="ilt-surface-accent p-5">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              Choose settings based on your situation
            </div>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-[var(--ilt-text-secondary)]">
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

            <div className="mt-4 ilt-surface-accent p-4 text-sm text-[var(--ilt-text-secondary)]">
              <span className="font-semibold text-[var(--ilt-text-primary)]">
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
          <h3 className="text-lg font-semibold text-[var(--ilt-text-primary)]">
            What you’ll see while tapping
          </h3>

          <p className="mt-2 text-[var(--ilt-text-secondary)] leading-relaxed">
            The large number is your estimated BPM. Under it, you’ll see the
            timing breakdown: milliseconds per beat (ms/beat), and quick
            references for ms/8th and ms/16th. Those are computed from the same
            BPM: ms/beat is the duration of one beat, ms/8th is half that, and
            ms/16th is one quarter. This makes the page useful even when you are
            not thinking in BPM. If you are working with timing in a DAW or
            practicing subdivisions, “how many milliseconds per beat” is often
            the number you actually apply.
          </p>

          <p className="mt-3 text-[var(--ilt-text-secondary)] leading-relaxed">
            The session panel shows how many taps you made, how many intervals
            were used, and a simple stability label. That label is not a score
            to chase. It’s a quick signal: if you see “Wobbly,” you probably
            want a few more steady taps before you lock or copy. If you see
            “Steady,” you can trust the estimate more.
          </p>

          <h3 className="mt-8 text-lg font-semibold text-[var(--ilt-text-primary)]">
            Real scenarios with numbers you might actually get
          </h3>

          <p className="mt-2 text-[var(--ilt-text-secondary)] leading-relaxed">
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

          <div className="mt-6 ilt-surface-muted p-5">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              Fullscreen, copy, and “keep it usable”
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              Fullscreen is for readability. The BPM becomes the focal point,
              with quick controls still available. This is useful in rehearsal,
              teaching, or studio setups where you are not sitting directly at
              the keyboard. Copy gives you a paste-ready note that includes the
              BPM and supporting session details. That is handy when you are
              communicating tempo to someone else or leaving yourself a clean
              note for later.
            </p>

            <div className="mt-3 flex flex-wrap gap-2 text-sm">
              <span className="ilt-surface-card px-3 py-2 text-[var(--ilt-text-secondary)]">
                <Kbd>F</Kbd> fullscreen
              </span>
              <span className="ilt-surface-card px-3 py-2 text-[var(--ilt-text-secondary)]">
                <Kbd>R</Kbd> reset
              </span>
              <span className="ilt-surface-card px-3 py-2 text-[var(--ilt-text-secondary)]">
                <Kbd>C</Kbd> copy
              </span>
              <span className="ilt-surface-card px-3 py-2 text-[var(--ilt-text-secondary)]">
                <Kbd>Esc</Kbd> exit
              </span>
              <span className="ilt-surface-card px-3 py-2 text-[var(--ilt-text-secondary)]">
                <Kbd>Space</Kbd>/<Kbd>Enter</Kbd> tap (optional)
              </span>
            </div>

            <div className="mt-4 ilt-surface-card p-4 text-sm text-[var(--ilt-text-secondary)]">
              <span className="font-semibold text-[var(--ilt-text-primary)]">Copy tip:</span> If
              you are comparing tempos, lock the first result, copy it, then
              unlock and tap the second phrase. Recent results lets you copy a
              previous reading quickly without re-tapping.
            </div>
          </div>
        </div>

        {/* Related tools */}
        <div className="mt-7 ilt-surface-card p-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
                Related tools (same intent, different output)
              </div>
              <p className="mt-1 text-sm text-[var(--ilt-text-secondary)]">
                Use Tap BPM to discover a tempo. Use a metronome when you want
                consistent clicks, or a timer when you want elapsed time or a
                countdown.
              </p>
            </div>
            <div className="text-xs text-[var(--ilt-text-muted)]">
              Shortcuts: <Kbd>F</Kbd> <Kbd>R</Kbd> <Kbd>C</Kbd> <Kbd>Esc</Kbd>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <PillLink href={abs("/metronome")}>Metronome</PillLink>
            <PillLink href={abs("/stopwatch")}>Stopwatch</PillLink>
            <PillLink href={abs("/pace-timer")}>Pace Timer</PillLink>
            <PillLink href={abs("/countdown-timer")}>Countdown Timer</PillLink>
            <PillLink href={abs("/online-timer")}>
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
        <details className="group mt-6 ilt-surface-muted p-6">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-1 py-2 ilt-focus-ring">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
                Technical details (BPM math, filtering, stability, persistence)
              </div>
              <div className="mt-1 text-xs font-medium text-[var(--ilt-text-muted)]">
                How the estimate is produced and why results can wobble early on
              </div>
            </div>
            <span className="shrink-0 ilt-inline-pill px-2 py-0.5 text-xs font-semibold text-[var(--ilt-text-secondary)] transition group-open:rotate-180">
              ▼
            </span>
          </summary>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="ilt-surface-card p-4 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">
                BPM calculation
              </div>
              <p className="mt-1 leading-relaxed">
                The tool converts your tap-to-tap intervals into BPM using 60000
                ÷ interval(ms). It uses the median of valid intervals rather
                than a simple mean, which makes the estimate less sensitive to
                one early or late tap.
              </p>
            </div>

            <div className="ilt-surface-card p-4 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">
                Interval filtering
              </div>
              <p className="mt-1 leading-relaxed">
                Extremely short or long gaps between taps are ignored. This
                helps prevent accidental double-taps or long pauses from
                dominating the result.
              </p>
            </div>

            <div className="ilt-surface-card p-4 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">
                Stability label
              </div>
              <p className="mt-1 leading-relaxed">
                Stability is estimated from how much your valid intervals vary.
                Lower spread reads as steadier; higher spread reads as wobbly.
                It’s meant as a quick signal, not a grade.
              </p>
            </div>

            <div className="ilt-surface-card p-4 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">
                Reset, hold, and lock behavior
              </div>
              <p className="mt-1 leading-relaxed">
                Reset ends the active session after inactivity. Hold keeps the
                last result visible after the session ends. Lock freezes the
                result and pauses automatic clearing and tap registration until
                you unlock.
              </p>
            </div>

            <div className="ilt-surface-card p-4 text-sm text-[var(--ilt-text-secondary)] md:col-span-2">
              <div className="font-semibold text-[var(--ilt-text-primary)]">
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
          <div className="ilt-surface-card px-4 py-3 text-sm text-[var(--ilt-text-secondary)]">
            <strong className="text-[var(--ilt-text-primary)]">Want consistent clicks?</strong>{" "}
            Tap to find the BPM, then use{" "}
            <a
              className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
              href={abs("/metronome")}
            >
              Metronome
            </a>{" "}
            to practice with a steady pulse.
          </div>

          <div className="ilt-surface-card px-4 py-3 text-sm text-[var(--ilt-text-secondary)]">
            <strong className="text-[var(--ilt-text-primary)]">Need pure timing?</strong> Use{" "}
            <a
              className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
              href={abs("/stopwatch")}
            >
              Stopwatch
            </a>{" "}
            for elapsed time or{" "}
            <a
              className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
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
