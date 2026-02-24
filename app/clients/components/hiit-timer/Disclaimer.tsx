import { Link } from "react-router";

export default function Disclaimer() {
  const preview =
    "Warm-up • Work • Rest • Rounds • Cool-down • Tabata preset • Boxing preset • Sound cues • Next/Reset • Fullscreen + shortcuts";

  return (
    <section className="mx-auto max-w-7xl px-4 pb-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <details className="group" open>
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-1 py-2 focus:outline-none focus:ring-2 focus:ring-amber-300/60">
            <div className="min-w-0">
              <h2 className="text-xl font-semibold text-sky-700">
                HIIT Timer at a glance
              </h2>
              <p className="mt-1 text-sm font-medium text-slate-600">
                {preview}
              </p>
            </div>

            <span className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-semibold text-slate-700 transition group-open:rotate-180">
              ▼
            </span>
          </summary>

          {/* What this page is for (tight, user-first) */}
          <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            <strong className="text-slate-900">
              Use this page to run repeatable intervals with a simple structure:
              warm-up → work/rest rounds → cool-down.
            </strong>{" "}
            Load a preset, tweak seconds and rounds, then start. You can pause,
            skip to the next phase, reset, and run it fullscreen with keyboard
            shortcuts.
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2 group-open:grid">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">
                Flexible interval setup.
              </strong>{" "}
              Set warm-up, work, rest, rounds, and cool-down. Use{" "}
              <span className="font-semibold text-slate-900">0 seconds</span> to
              skip warm-up or cool-down, or to run{" "}
              <span className="font-semibold text-slate-900">no rest</span>.
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">Quick presets.</strong> Start
              fast with{" "}
              <span className="font-semibold text-slate-900">
                Tabata 20/10 × 8
              </span>
              ,{" "}
              <span className="font-semibold text-slate-900">
                Intervals 40/20 × 10
              </span>
              , or{" "}
              <span className="font-semibold text-slate-900">
                Boxing 3:00/1:00 × 6
              </span>
              , then adjust if needed.
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">
                Start, pause, next, reset.
              </strong>{" "}
              Pause any time, jump to the next phase with{" "}
              <span className="font-semibold text-slate-900">Next</span>, or{" "}
              <span className="font-semibold text-slate-900">Reset</span> back
              to warm-up.
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">Sound cues (optional).</strong>{" "}
              Toggle Sound on/off. Optionally enable{" "}
              <span className="font-semibold text-slate-900">
                final 3-2-1 beeps
              </span>{" "}
              during <span className="font-semibold text-slate-900">work</span>{" "}
              only.
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">
                Fullscreen training view.
              </strong>{" "}
              Go fullscreen for a clean, big display with top controls. In
              fullscreen, you can{" "}
              <span className="font-semibold text-slate-900">
                tap/click the time
              </span>{" "}
              to start or pause. Exit with{" "}
              <span className="font-semibold text-slate-900">Esc</span>.
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">Large, readable timer.</strong>{" "}
              The time display auto-sizes to fit your screen, so it stays
              readable on phones, laptops, and wall displays.
            </div>
          </div>

          {/* 3-step "do this now" guidance */}
          <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
            <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
              Quick use
            </div>
            <ol className="mt-3 grid gap-2 text-sm text-slate-700 sm:grid-cols-3">
              <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <strong className="text-slate-900">1) Load or set</strong>: pick
                a preset or set seconds/rounds manually.
              </li>
              <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <strong className="text-slate-900">2) Choose cues</strong>: turn
                on Sound (optional) and final 3-2-1 beeps (work only).
              </li>
              <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <strong className="text-slate-900">3) Run it</strong>: press{" "}
                <span className="font-semibold text-slate-900">Start</span>. Use{" "}
                <span className="font-semibold text-slate-900">Next</span> to
                skip a phase or{" "}
                <span className="font-semibold text-slate-900">Reset</span> to
                restart.
              </li>
            </ol>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                Common setups
              </div>
              <ul className="mt-3 grid gap-2 text-sm text-slate-700">
                <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <strong className="text-slate-900">Tabata</strong>: 20s work /
                  10s rest × 8 rounds (warm-up/cool-down optional).
                </li>
                <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <strong className="text-slate-900">Intervals</strong>: longer
                  work/rest for conditioning (example preset: 40/20 × 10).
                </li>
                <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <strong className="text-slate-900">Rounds (boxing)</strong>:
                  3:00 work / 1:00 rest × 6 rounds.
                </li>
                <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <strong className="text-slate-900">No-rest EMOM-style</strong>
                  : set Rest to 0 and use Rounds to control total reps.
                </li>
              </ul>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                Related tools
              </div>
              <div className="mt-3 grid gap-2 text-sm text-slate-700">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  Want a dedicated Tabata page?{" "}
                  <Link
                    to="/tabata-timer"
                    className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Tabata Timer
                  </Link>
                  .
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  Need EMOM or AMRAP formats?{" "}
                  <Link
                    to="/emom-timer"
                    className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    EMOM Timer
                  </Link>{" "}
                  or{" "}
                  <Link
                    to="/amrap-timer"
                    className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    AMRAP Timer
                  </Link>
                  .
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  Prefer a simple round bell timer?{" "}
                  <Link
                    to="/round-timer"
                    className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Round Timer
                  </Link>
                  .
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  Want fewer controls and a big screen?{" "}
                  <Link
                    to="/fullscreen-timer"
                    className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Fullscreen Timer
                  </Link>
                  .
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  Looking for a general workout tool set?{" "}
                  <Link
                    to="/workout-timer"
                    className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Workout Timer
                  </Link>
                  .
                </div>
              </div>
            </div>
          </div>

          {/* Technical / documentation content stays tucked away */}
          <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
            <details className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-lg px-1 py-2 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-300/60">
                <span>Controls + behavior details</span>
                <span className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-semibold text-slate-700 transition group-open:rotate-180">
                  ▼
                </span>
              </summary>

              <div className="mt-2 grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                    Keyboard shortcuts
                  </div>
                  <p className="mt-2">
                    <span className="font-semibold text-slate-900">Space</span>{" "}
                    start/pause ·{" "}
                    <span className="font-semibold text-slate-900">N</span> next
                    · <span className="font-semibold text-slate-900">R</span>{" "}
                    reset ·{" "}
                    <span className="font-semibold text-slate-900">F</span>{" "}
                    fullscreen ·{" "}
                    <span className="font-semibold text-slate-900">Esc</span>{" "}
                    exit fullscreen.
                  </p>
                  <p className="mt-2">
                    Shortcuts are ignored while typing in inputs.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                    Phase flow
                  </div>
                  <p className="mt-2">
                    Warm-up runs once, then the timer alternates{" "}
                    <span className="font-semibold text-slate-900">Work</span>{" "}
                    and{" "}
                    <span className="font-semibold text-slate-900">Rest</span>{" "}
                    for your selected number of rounds, then ends with
                    cool-down.
                  </p>
                  <p className="mt-2">
                    If Rest is{" "}
                    <span className="font-semibold text-slate-900">0</span>, the
                    timer goes work → work between rounds.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                    “Next” behavior
                  </div>
                  <p className="mt-2">
                    Next stops the current phase and immediately advances to the
                    next phase in the sequence. Use it to skip warm-up, skip a
                    rest, or jump into cool-down.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                    Sound notes
                  </div>
                  <p className="mt-2">
                    Some browsers require a user gesture before audio will play.
                    If you do not hear cues, press{" "}
                    <span className="font-semibold text-slate-900">Start</span>{" "}
                    once, then enable Sound and try again.
                  </p>
                  <p className="mt-2">
                    Final 3-2-1 beeps trigger in the last 3 seconds of{" "}
                    <span className="font-semibold text-slate-900">work</span>{" "}
                    only.
                  </p>
                </div>
              </div>
            </details>
          </div>

          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            <strong className="text-slate-900">Tip.</strong> For a hands-free
            setup: go fullscreen, keep Sound on, and use{" "}
            <strong className="text-slate-900">Space</strong> to start/pause and{" "}
            <strong className="text-slate-900">N</strong> to skip to the next
            phase when you need it.
          </div>
        </details>
      </div>
    </section>
  );
}
