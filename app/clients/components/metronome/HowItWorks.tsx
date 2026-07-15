import React from "react";
import { Link } from "react-router";

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
   - Metronome intent: BPM + tap tempo + time signature + subdivisions
   - Tool-focused (practice workflow), not music theory lessons
   - Scenario-based with concrete numbers users will see on this page
   - Technical details live in an expandable section
   - Aim: ~800–1200 words of unique, intent-matching content
========================================================= */
export default function HowItWorks({
  canonicalUrl = "https://www.ilovetimers.com/metronome",
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
    to,
    children,
  }: {
    to: string;
    children: React.ReactNode;
  }) => (
    <Link
      to={to}
      className="cursor-pointer ilt-inline-pill px-3 py-1.5 text-sm font-semibold text-[var(--ilt-text-primary)] transition hover:bg-[var(--ilt-bg-hover)]"
    >
      {children} →
    </Link>
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
        <div className="whitespace-pre-wrap font-mono text-xs text-[var(--ilt-text-secondary)]">
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

            <p className="mt-2 max-w-3xl leading-relaxed text-[var(--ilt-text-secondary)]">
              <span className="font-semibold text-[var(--ilt-text-primary)]">
                This metronome
              </span>{" "}
              is built for one thing: helping you{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">
                practice at a steady tempo
              </span>{" "}
              without fighting the UI. Set a BPM, press{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">Start</span>, and
              you get a clean audio tick plus a visual pulse that stays easy to
              follow. You can quickly switch time signatures, choose
              subdivisions (quarter, eighth, triplet, sixteenth), accent the
              downbeat, and adjust click sound and volume for your room or
              headphones.
            </p>

            <p className="mt-3 max-w-3xl leading-relaxed text-[var(--ilt-text-secondary)]">
              This page is tool-first. It is not a music theory article and it
              does not try to teach you how to count or what a time signature
              “means.” Instead, it focuses on what you came here to do: match
              tempo quickly (Tap Tempo), keep time with a consistent pulse, and
              run common practice setups with minimal friction. Fullscreen
              exists because many people practice several feet from their laptop
              or phone, and a big BPM display with a clear pulse is easier to
              glance at.
            </p>

            <p className="mt-3 max-w-3xl leading-relaxed text-[var(--ilt-text-secondary)]">
              The center display always shows the{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">current BPM</span>,
              plus a ring pulse with a live readout like{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">
                Beat 2 / 4 · Sub 1 / 2 · Tick
              </span>
              . That beat/sub counter matters in real use. If you pick 4/4 with
              eighth notes, the metronome ticks twice per beat and you will see
              the subdivision count flip between 1 and 2 as you play.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 sm:justify-end">
            <span className="ilt-inline-pill px-3 py-1 text-xs font-semibold text-[var(--ilt-text-secondary)]">
              BPM
            </span>
            <span className="ilt-inline-pill px-3 py-1 text-xs font-semibold text-[var(--ilt-text-secondary)]">
              Tap tempo
            </span>
            <span className="ilt-inline-pill px-3 py-1 text-xs font-semibold text-[var(--ilt-text-secondary)]">
              Time signature
            </span>
            <span className="ilt-inline-pill px-3 py-1 text-xs font-semibold text-[var(--ilt-text-secondary)]">
              Subdivision
            </span>
            <span className="ilt-inline-pill px-3 py-1 text-xs font-semibold text-[var(--ilt-text-secondary)]">
              Accent
            </span>
            <span className="ilt-inline-pill px-3 py-1 text-xs font-semibold text-[var(--ilt-text-secondary)]">
              Click sounds
            </span>
            <span className="ilt-inline-pill px-3 py-1 text-xs font-semibold text-[var(--ilt-text-secondary)]">
              Fullscreen
            </span>
            <span className="ilt-inline-pill px-3 py-1 text-xs font-semibold text-[var(--ilt-text-secondary)]">
              Shortcuts
            </span>
            <span className="ilt-inline-pill px-3 py-1 text-xs font-semibold text-[var(--ilt-text-secondary)]">
              Copy
            </span>
          </div>
        </div>

        {/* Quick flow */}
        <div className="mt-6 grid gap-4 lg:grid-cols-[1.12fr_0.88fr]">
          <div className="ilt-surface-muted p-5">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              Quick use (what most people do)
            </div>

            <ol className="mt-3 space-y-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              <li>
                <span className="font-semibold text-[var(--ilt-text-primary)]">1)</span> Set
                your BPM with the slider or number input, or tap{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">Tap</span> (or{" "}
                <Kbd>T</Kbd>) a few times to match a song.
              </li>
              <li>
                <span className="font-semibold text-[var(--ilt-text-primary)]">2)</span> Choose{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">
                  time signature
                </span>{" "}
                and{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">
                  subdivision
                </span>{" "}
                for the feel you want (quarter, eighth, triplet, sixteenth).
              </li>
              <li>
                <span className="font-semibold text-[var(--ilt-text-primary)]">3)</span> Press{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">Start</span> (or{" "}
                <Kbd>Space</Kbd>/<Kbd>Enter</Kbd>) to begin. You will see the
                status switch to{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">Running</span>.
              </li>
              <li>
                <span className="font-semibold text-[var(--ilt-text-primary)]">4)</span> If you
                want measure clarity, enable{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">
                  Accent beat 1
                </span>{" "}
                so the downbeat is stronger.
              </li>
              <li>
                <span className="font-semibold text-[var(--ilt-text-primary)]">5)</span> Press{" "}
                <Kbd>F</Kbd> for fullscreen. In fullscreen, you can{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">
                  click/tap the display
                </span>{" "}
                to start or stop without aiming for buttons.
              </li>
              <li>
                <span className="font-semibold text-[var(--ilt-text-primary)]">6)</span> Press{" "}
                <Kbd>C</Kbd> to copy your setup (BPM, signature, subdivision,
                sound, volume, and link) for a teacher, bandmate, or future you.
              </li>
            </ol>

            <div className="mt-4 ilt-surface-card p-4">
              <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
                What “subdivision” means on this page
              </div>
              <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
                Subdivision is simply how many ticks happen inside each beat. If
                you set
                <span className="font-semibold text-[var(--ilt-text-primary)]"> 120 BPM</span>,
                that’s 120 beats per minute. With{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">Eighth (2)</span>
                , the metronome ticks twice per beat, so you effectively hear{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">
                  240 ticks per minute
                </span>
                . With{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">
                  Sixteenth (4)
                </span>
                , you hear{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">
                  480 ticks per minute
                </span>
                . The beat/sub counter updates so you can follow where you are.
              </p>
            </div>
          </div>

          <div className="ilt-surface-accent p-5">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              Practical checklist
            </div>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-[var(--ilt-text-secondary)]">
              <li>
                If you can’t hear the tick, increase device volume and unmute
                the tab. Some browsers require a click before audio starts.
              </li>
              <li>
                If shortcuts do nothing, click the metronome card once so it has
                focus.
              </li>
              <li>
                If a click sound feels harsh, switch to{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">Wood</span> or
                lower volume.
              </li>
              <li>
                If you only need BPM detection from tapping, use{" "}
                <Link
                  className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
                  to="/bpm-tapper"
                >
                  BPM Tapper
                </Link>
                .
              </li>
              <li>
                If you want timed practice blocks, pair this with{" "}
                <Link
                  className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
                  to="/countdown-timer"
                >
                  Countdown Timer
                </Link>
                .
              </li>
            </ul>

            <div className="mt-4 ilt-surface-accent p-4 text-sm text-[var(--ilt-text-secondary)]">
              <span className="font-semibold text-[var(--ilt-text-primary)]">Shortcuts:</span>{" "}
              <Kbd>Space</Kbd>/<Kbd>Enter</Kbd> start/stop, <Kbd>T</Kbd> tap,{" "}
              <Kbd>↑</Kbd>/<Kbd>↓</Kbd> BPM, <Kbd>F</Kbd> fullscreen,{" "}
              <Kbd>C</Kbd> copy, <Kbd>Esc</Kbd> exit.
            </div>
          </div>
        </div>

        {/* Main explanation */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-[var(--ilt-text-primary)]">
            What this metronome is optimized for
          </h3>

          <p className="mt-2 leading-relaxed text-[var(--ilt-text-secondary)]">
            In practice, a metronome succeeds or fails on two things: how
            quickly you can set it up, and whether it stays consistent once you
            hit Start. This page is optimized for fast setup and low friction
            while you are holding an instrument. That is why you can set BPM in
            multiple ways (slider, number input, arrow keys), why Tap Tempo is
            one keystroke away, and why fullscreen lets you start or stop by
            clicking the display. You should not need a menu hunt to do basic
            tempo work.
          </p>

          <p className="mt-3 leading-relaxed text-[var(--ilt-text-secondary)]">
            The second design goal is clarity. The visual pulse is not
            decorative. It is tied to the same tick schedule that drives the
            audio, and it includes a simple readout of the current beat and
            subdivision. If you are practicing a part that “lands on the and of
            2,” the eighth-note subdivision makes that placement obvious because
            you will hear two ticks per beat and you will see the subdivision
            counter flip between 1 and 2. If you are drilling triplets, you will
            see{" "}
            <span className="font-semibold text-[var(--ilt-text-primary)]">
              Sub 1 / 3 → Sub 2 / 3 → Sub 3 / 3
            </span>{" "}
            repeating.
          </p>

          <p className="mt-3 leading-relaxed text-[var(--ilt-text-secondary)]">
            Accent beat 1 is included because many people practice in measures,
            not in an endless stream of ticks. With accent enabled, the first
            beat of the bar is emphasized, making it easier to keep track of
            where you are without counting out loud. This is helpful for longer
            phrases, repeats, and ensemble rehearsal where bar alignment
            matters.
          </p>

          <h3 className="mt-8 text-lg font-semibold text-[var(--ilt-text-primary)]">
            Scenarios with concrete numbers (what you will see on this page)
          </h3>

          <p className="mt-2 leading-relaxed text-[var(--ilt-text-secondary)]">
            The examples below are written to match what this metronome actually
            shows: BPM in big numbers, a running status, a pulse ring, and a
            beat/sub counter. The numbers and counters are the same ones you
            will see while you use the tool.
          </p>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <ExampleBlock
              title="Scenario 1: Match a track with Tap Tempo, then lock it in"
              subtitle="Tap first, practice second."
              lines={[
                "Goal: match a song tempo quickly.",
                "",
                "What you do:",
                "- Tap the beat 6–8 times (T).",
                "- The BPM display updates (example: 128).",
                "- Press Start.",
                "",
                "What you see while running:",
                "- Big BPM: 128",
                "- Status: Running",
                "- Beat counter: Beat 1 / 4, Beat 2 / 4, ...",
                "- Sub counter depends on your subdivision selection.",
                "",
                "If you tap again later:",
                "- Tap a new tempo (example: 132) and BPM updates immediately.",
              ]}
            />

            <ExampleBlock
              title="Scenario 2: Eighth-note consistency at 96 BPM"
              subtitle="Two ticks per beat, easy ‘and’ placement."
              lines={[
                "Setup:",
                "- BPM = 96",
                "- Time signature = 4/4",
                "- Subdivision = Eighth (2)",
                "- Accent beat 1 = On",
                "",
                "What you will hear and see:",
                "- Two ticks per beat (96 beats/min → 192 ticks/min).",
                "- Beat 1 is accented each bar.",
                "- Display cycles like:",
                "  Beat 1 / 4 · Sub 1 / 2 · Accent",
                "  Beat 1 / 4 · Sub 2 / 2 · Tick",
                "  Beat 2 / 4 · Sub 1 / 2 · Tick",
                "  Beat 2 / 4 · Sub 2 / 2 · Tick",
              ]}
            />

            <ExampleBlock
              title="Scenario 3: Triplet drill at 72 BPM"
              subtitle="Three ticks per beat for triplet feel."
              lines={[
                "Setup:",
                "- BPM = 72",
                "- Time signature = 3/4",
                "- Subdivision = Triplet (3)",
                "",
                "What you will see:",
                "- Beat cycles 1 → 2 → 3",
                "- Sub cycles 1 → 2 → 3 each beat",
                "- Example run:",
                "  Beat 1 / 3 · Sub 1 / 3 · Tick",
                "  Beat 1 / 3 · Sub 2 / 3 · Tick",
                "  Beat 1 / 3 · Sub 3 / 3 · Tick",
                "  Beat 2 / 3 · Sub 1 / 3 · Tick",
              ]}
            />

            <ExampleBlock
              title="Scenario 4: Slow build tempo ladder (keyboard-only control)"
              subtitle="Increase BPM without touching the mouse."
              lines={[
                "Goal: increase tempo in small steps.",
                "",
                "Setup:",
                "- Start BPM = 60",
                "- Subdivision = Quarter (1)",
                "",
                "Workflow:",
                "- Press Space to Start.",
                "- After 30–60 seconds, press ↑ five times:",
                "  BPM 60 → 61 → 62 → 63 → 64 → 65",
                "- Or use Shift + ↑ for bigger steps:",
                "  BPM 65 → 70 → 75",
                "",
                "What you see:",
                "- Big BPM updates instantly as you press keys.",
                "- The tick speed changes without restarting.",
              ]}
            />

            <ExampleBlock
              title="Scenario 5: Fullscreen practice across the room"
              subtitle="Big display with click-to-start/stop."
              lines={[
                "Setup:",
                "- Press F to enter fullscreen.",
                "",
                "In fullscreen:",
                "- Tap/click the big display to Start.",
                "- Tap/click again to Stop.",
                "- Use +5 / -5 buttons in the top bar for quick changes.",
                "- Exit with Esc.",
                "",
                "What you see:",
                "- Large BPM digits (example: 110).",
                "- Pulse ring flashing each tick.",
                "- A small hint row with settings (signature, subdivision, sound, volume).",
              ]}
            />

            <ExampleBlock
              title="Scenario 6: Share a rehearsal setup with Copy"
              subtitle="One consistent setup for everyone."
              lines={[
                "Goal: send a bandmate the exact metronome setup.",
                "",
                "Setup:",
                "- BPM = 124",
                "- Time signature = 4/4",
                "- Subdivision = Sixteenth (4)",
                "- Accent beat 1 = Off",
                "- Sound = Beep",
                "- Volume = 60%",
                "",
                "What you do:",
                "- Press C (or click Copy).",
                "",
                "What gets copied (example):",
                "Online Metronome",
                "BPM: 124",
                "Time signature: 4/4",
                "Subdivision: Sixteenth",
                "Accent downbeat: Off",
                "Sound: beep",
                "Volume: 60%",
                "Time zone: <your device time zone>",
                "https://www.ilovetimers.com/metronome",
              ]}
            />
          </div>

          <div className="mt-6 ilt-surface-muted p-5">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              Pick the right page when your goal is slightly different
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              This route is for a tempo reference: steady ticks, bar counting,
              and quick BPM control. If you only want to discover BPM by
              tapping, use the BPM tapper. If you want timed practice blocks
              (for example 10 minutes of scales, 5 minutes of arpeggios), use a
              countdown timer alongside the metronome. If you need a generic
              large display for timekeeping rather than tempo, use the
              fullscreen timer.
            </p>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              Tap-only:{" "}
              <Link
                className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
                to="/bpm-tapper"
              >
                BPM Tapper
              </Link>
              . Practice blocks:{" "}
              <Link
                className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
                to="/countdown-timer"
              >
                Countdown Timer
              </Link>
              . Big display:{" "}
              <Link
                className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
                to="/fullscreen-timer"
              >
                Fullscreen Timer
              </Link>
              .
            </p>
          </div>
        </div>

        {/* Related tools */}
        <div className="mt-7 ilt-surface-card p-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
                Related tools (same site, different job)
              </div>
              <p className="mt-1 text-sm text-[var(--ilt-text-secondary)]">
                Pick the closest match to what you are trying to do.
              </p>
            </div>
            <div className="text-xs text-[var(--ilt-text-muted)]">
              Shortcuts: <Kbd>Space</Kbd> <Kbd>T</Kbd> <Kbd>F</Kbd> <Kbd>C</Kbd>{" "}
              <Kbd>Esc</Kbd>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <PillLink to="/bpm-tapper">BPM Tapper</PillLink>
            <PillLink to="/pace-timer">Pace Timer</PillLink>
            <PillLink to="/countdown-timer">Countdown Timer</PillLink>
            <PillLink to="/stopwatch">Stopwatch</PillLink>
            <PillLink to="/fullscreen-timer">Fullscreen Timer</PillLink>
            <PillLink to="/hiit-timer">HIIT Timer</PillLink>
          </div>
        </div>

        {/* Technical details expandable */}
        <details className="group mt-6 ilt-surface-muted p-6">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-1 py-2 ilt-focus-ring">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
                Technical details (audio scheduling, timing, focus, fullscreen)
              </div>
              <div className="mt-1 text-xs font-medium text-[var(--ilt-text-muted)]">
                Optional notes if you rely on exact behavior
              </div>
            </div>
            <span className="shrink-0 ilt-inline-pill px-2 py-0.5 text-xs font-semibold text-[var(--ilt-text-secondary)] transition group-open:rotate-180">
              ▼
            </span>
          </summary>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="ilt-surface-card p-4 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">
                Scheduling model (why it stays steady)
              </div>
              <p className="mt-1 leading-relaxed">
                The metronome schedules upcoming ticks slightly ahead of time
                using WebAudio timing. The UI updates the visual pulse as ticks
                are scheduled so the audio and visuals stay aligned.
              </p>
            </div>

            <div className="ilt-surface-card p-4 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">
                BPM, beats, and subdivision math
              </div>
              <p className="mt-1 leading-relaxed">
                Seconds per beat is{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">60 / BPM</span>.
                Seconds per subdivision tick is that value divided by the
                subdivision count (1, 2, 3, or 4). Beat and subdivision counters
                are derived from the tick index.
              </p>
            </div>

            <div className="ilt-surface-card p-4 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">
                Audio permissions
              </div>
              <p className="mt-1 leading-relaxed">
                Some browsers suspend audio until a user gesture. If you do not
                hear ticks, click Start once (or tap the display in fullscreen)
                and try again.
              </p>
            </div>

            <div className="ilt-surface-card p-4 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">
                Keyboard focus rules
              </div>
              <p className="mt-1 leading-relaxed">
                Shortcuts are handled on the metronome card. If they do not
                work, click the card once to focus it. While typing in an input
                or changing a select, shortcuts are ignored.
              </p>
            </div>

            <div className="ilt-surface-card p-4 text-sm text-[var(--ilt-text-secondary)] md:col-span-2">
              <div className="font-semibold text-[var(--ilt-text-primary)]">
                Fullscreen targeting
              </div>
              <p className="mt-1 leading-relaxed">
                Fullscreen is applied to the metronome card so the BPM display
                and controls stay together. In fullscreen, tapping or clicking
                the display toggles start/stop, and Esc exits.
              </p>
            </div>
          </div>
        </details>

        {/* Bottom note */}
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="ilt-surface-card px-4 py-3 text-sm text-[var(--ilt-text-secondary)]">
            <strong className="text-[var(--ilt-text-primary)]">Only need BPM detection?</strong>{" "}
            Use{" "}
            <Link
              className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
              to="/bpm-tapper"
            >
              BPM Tapper
            </Link>{" "}
            to tap and read BPM without the metronome tick.
          </div>

          <div className="ilt-surface-card px-4 py-3 text-sm text-[var(--ilt-text-secondary)]">
            <strong className="text-[var(--ilt-text-primary)]">
              Want timed practice blocks?
            </strong>{" "}
            Pair this with{" "}
            <Link
              className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
              to="/countdown-timer"
            >
              Countdown Timer
            </Link>{" "}
            for structured intervals.
          </div>
        </div>

        {/* Small SEO anchor text without being bloggy */}
        <div className="mt-6 ilt-surface-muted px-4 py-3 text-sm text-[var(--ilt-text-secondary)]">
          <strong className="text-[var(--ilt-text-primary)]">In one sentence:</strong> this
          online metronome gives you BPM control with tap tempo, time
          signatures, subdivisions, an optional downbeat accent, selectable
          click sounds and volume, fullscreen mode, keyboard shortcuts, and
          one-click copy so you can practice with a steady pulse without extra
          setup.
        </div>

        {/* Hidden absolute URL usage so abs() is not dead-code when tree-shaken */}
        <span className="sr-only" aria-hidden="true">
          {abs("/metronome")}
        </span>
      </div>
    </section>
  );
}
