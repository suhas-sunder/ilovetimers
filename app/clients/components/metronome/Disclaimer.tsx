import { Link } from "react-router";

export default function Disclaimer() {
  const preview =
    "BPM control • Tap tempo • Time signature + subdivision • Downbeat accent • Fullscreen • Keyboard shortcuts • Copy settings";

  return (
    <section className="mx-auto max-w-7xl px-4 pb-6">
      <div className="ilt-surface-card p-5">
        <details className="group" open>
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-1 py-2 ilt-focus-ring">
            <div className="min-w-0">
              <h2 className="text-xl font-semibold text-[var(--ilt-text-primary)]">
                Metronome at a glance
              </h2>
              <p className="mt-1 text-sm font-medium text-[var(--ilt-text-muted)]">
                {preview}
              </p>
            </div>

            <span className="shrink-0 ilt-inline-pill px-2 py-0.5 text-xs font-semibold text-[var(--ilt-text-secondary)] transition group-open:rotate-180">
              ▼
            </span>
          </summary>

          {/* What this page is for (tight, user-first) */}
          <div className="mt-3 ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
            <strong className="text-[var(--ilt-text-primary)]">
              Use this page to lock in tempo while you practice.
            </strong>{" "}
            Set a BPM, press <strong className="text-[var(--ilt-text-primary)]">Start</strong>,
            and follow the visual pulse plus a clean audio tick. Use{" "}
            <strong className="text-[var(--ilt-text-primary)]">Tap tempo</strong> when you want
            to match a song quickly, then switch to{" "}
            <strong className="text-[var(--ilt-text-primary)]">Fullscreen</strong> for a big,
            distraction-free display.
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2 group-open:grid">
            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">BPM control.</strong>{" "}
              Use the slider, number input, or arrow keys to set tempo from{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">20 to 400</span>{" "}
              BPM. Shift + arrows adjusts by{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">5</span>.
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">Tap tempo.</strong> Hit{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">Tap</span> (or{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">T</span>) a few
              times to detect your tempo and set BPM automatically. Great for
              matching a groove before practicing.
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">
                Time signature + subdivision.
              </strong>{" "}
              Choose beats per bar and whether you want quarter notes, eighths,
              triplets, or sixteenths. The display shows current{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">beat</span> and{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">subdivision</span>{" "}
              so you always know where you are in the bar.
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">Accent beat 1.</strong> Toggle{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">
                Accent beat 1
              </span>{" "}
              to make the downbeat pop. This helps when counting measures or
              drilling tight entrances.
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">Click sounds + volume.</strong>{" "}
              Switch between{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">Click</span>,{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">Wood</span>, and{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">Beep</span>, then
              set a comfortable level. If your speaker is tiny,{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">Beep</span> is
              usually easiest to hear.
            </div>

            <div className="ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
              <strong className="text-[var(--ilt-text-primary)]">Fullscreen practice.</strong>{" "}
              Press <span className="font-semibold text-[var(--ilt-text-primary)]">F</span> to
              go fullscreen. In fullscreen,{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">
                click/tap the display
              </span>{" "}
              to start or stop quickly. Exit with{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">Esc</span>.
            </div>
          </div>

          {/* 3-step "do this now" guidance */}
          <div className="mt-4 ilt-surface-card p-4">
            <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
              Quick use
            </div>
            <ol className="mt-3 grid gap-2 text-sm text-[var(--ilt-text-secondary)] sm:grid-cols-3">
              <li className="ilt-surface-muted p-3">
                <strong className="text-[var(--ilt-text-primary)]">1) Set tempo</strong>: choose
                a BPM, or tap{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">T</span> a few
                times.
              </li>
              <li className="ilt-surface-muted p-3">
                <strong className="text-[var(--ilt-text-primary)]">2) Pick the feel</strong>:
                set time signature, subdivision, and whether to accent beat 1.
              </li>
              <li className="ilt-surface-muted p-3">
                <strong className="text-[var(--ilt-text-primary)]">3) Start and play</strong>:
                press{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">Space</span> to
                start/stop. Go fullscreen for a bigger pulse.
              </li>
            </ol>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="ilt-surface-card p-4">
              <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                Quick practice setups
              </div>
              <ul className="mt-3 grid gap-2 text-sm text-[var(--ilt-text-secondary)]">
                <li className="ilt-surface-muted p-3">
                  <strong className="text-[var(--ilt-text-primary)]">Warm-up</strong>: start at
                  a comfortable BPM, then bump tempo in small steps with{" "}
                  <span className="font-semibold text-[var(--ilt-text-primary)]">↑/↓</span>{" "}
                  (Shift for ±5).
                </li>
                <li className="ilt-surface-muted p-3">
                  <strong className="text-[var(--ilt-text-primary)]">Subdivision drill</strong>:
                  keep BPM steady, switch to{" "}
                  <span className="font-semibold text-[var(--ilt-text-primary)]">Eighth</span>{" "}
                  or{" "}
                  <span className="font-semibold text-[var(--ilt-text-primary)]">Triplet</span>{" "}
                  to clean up timing between beats.
                </li>
                <li className="ilt-surface-muted p-3">
                  <strong className="text-[var(--ilt-text-primary)]">Downbeat awareness</strong>
                  : turn{" "}
                  <span className="font-semibold text-[var(--ilt-text-primary)]">
                    Accent beat 1
                  </span>{" "}
                  on to lock your measure starts, then turn it off to test your
                  internal count.
                </li>
                <li className="ilt-surface-muted p-3">
                  <strong className="text-[var(--ilt-text-primary)]">Silent room</strong>: lower
                  volume and rely on the visual pulse, or swap to{" "}
                  <span className="font-semibold text-[var(--ilt-text-primary)]">Wood</span> for
                  a softer tick.
                </li>
              </ul>
            </div>

            <div className="ilt-surface-card p-4">
              <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                Related tools
              </div>
              <div className="mt-3 grid gap-2 text-sm text-[var(--ilt-text-secondary)]">
                <div className="ilt-surface-muted p-3">
                  Just want to find BPM from tapping?{" "}
                  <Link
                    to="/bpm-tapper"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    BPM Tapper
                  </Link>
                  .
                </div>

                <div className="ilt-surface-muted p-3">
                  Need a simple countdown for practice blocks?{" "}
                  <Link
                    to="/countdown-timer"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Countdown Timer
                  </Link>
                  .
                </div>

                <div className="ilt-surface-muted p-3">
                  Tracking how long you practiced?{" "}
                  <Link
                    to="/stopwatch"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Stopwatch
                  </Link>
                  .
                </div>

                <div className="ilt-surface-muted p-3">
                  Want a big screen view for a room?{" "}
                  <Link
                    to="/online-timer"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Fullscreen Timer
                  </Link>
                  .
                </div>

                <div className="ilt-surface-muted p-3">
                  Matching movement pace instead of musical tempo?{" "}
                  <Link
                    to="/pace-timer"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Pace Timer
                  </Link>
                  .
                </div>

                <div className="ilt-surface-muted p-3">
                  Practicing intervals (work/rest)?{" "}
                  <Link
                    to="/hiit-timer"
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    HIIT Timer
                  </Link>
                  .
                </div>
              </div>
            </div>
          </div>

          {/* Technical / documentation content stays tucked away */}
          <div className="mt-4 ilt-surface-card p-4">
            <details className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-lg px-1 py-2 text-sm font-semibold text-[var(--ilt-text-primary)] ilt-focus-ring">
                <span>Controls + behavior details</span>
                <span className="shrink-0 ilt-inline-pill px-2 py-0.5 text-xs font-semibold text-[var(--ilt-text-secondary)] transition group-open:rotate-180">
                  ▼
                </span>
              </summary>

              <div className="mt-2 grid gap-3 text-sm text-[var(--ilt-text-secondary)] sm:grid-cols-2">
                <div className="ilt-surface-muted p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                    Keyboard shortcuts
                  </div>
                  <p className="mt-2">
                    <span className="font-semibold text-[var(--ilt-text-primary)]">Space</span>{" "}
                    start/stop ·{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">Enter</span>{" "}
                    start/stop ·{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">T</span> tap
                    tempo ·{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">↑/↓</span>{" "}
                    BPM ·{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">
                      Shift + ↑/↓
                    </span>{" "}
                    ±5 · <span className="font-semibold text-[var(--ilt-text-primary)]">F</span>{" "}
                    fullscreen ·{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">C</span> copy
                    settings ·{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">Esc</span>{" "}
                    exit fullscreen.
                  </p>
                  <p className="mt-2">
                    Shortcuts are ignored while typing in inputs.
                  </p>
                </div>

                <div className="ilt-surface-muted p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                    Visual pulse behavior
                  </div>
                  <p className="mt-2">
                    The ring flashes on every tick. Beat and subdivision
                    counters update alongside the flash so you can follow the
                    bar without guessing.
                  </p>
                  <p className="mt-2">
                    If{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">
                      Accent beat 1
                    </span>{" "}
                    is enabled, the downbeat flash and sound are stronger.
                  </p>
                </div>

                <div className="ilt-surface-muted p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                    Fullscreen behavior
                  </div>
                  <p className="mt-2">
                    Fullscreen expands the BPM display to fit your screen and
                    keeps lightweight controls at the top and a shortcut hint at
                    the bottom.
                  </p>
                  <p className="mt-2">
                    If fullscreen is blocked, try again after an explicit click
                    on the Fullscreen button (some browsers require a user
                    gesture).
                  </p>
                </div>

                <div className="ilt-surface-muted p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                    Audio notes
                  </div>
                  <p className="mt-2">
                    If you do not hear the tick, check device volume and make
                    sure your browser tab is not muted. Some browsers delay
                    audio until after a user gesture, so press Start once if
                    needed.
                  </p>
                  <p className="mt-2">
                    If the click sounds too similar on a small speaker, switch
                    between{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">Beep</span>{" "}
                    and{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">Click</span>,
                    or use headphones.
                  </p>
                </div>

                <div className="ilt-surface-muted p-4 sm:col-span-2">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
                    Copy settings
                  </div>
                  <p className="mt-2">
                    Press{" "}
                    <span className="font-semibold text-[var(--ilt-text-primary)]">C</span> (or
                    click Copy) to copy your current setup: BPM, time signature,
                    subdivision, accent, sound type, volume, and the page link.
                  </p>
                </div>
              </div>
            </details>
          </div>

          <div className="mt-4 ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
            <strong className="text-[var(--ilt-text-primary)]">Tip.</strong> For clean tempo
            work, keep one hand on{" "}
            <strong className="text-[var(--ilt-text-primary)]">Space</strong> to start/stop and
            use <strong className="text-[var(--ilt-text-primary)]">↑/↓</strong> to nudge BPM
            without touching the mouse. If timing feels messy, switch to{" "}
            <strong className="text-[var(--ilt-text-primary)]">Eighth</strong> subdivision and
            slow down until everything lines up.
          </div>
        </details>
      </div>
    </section>
  );
}
