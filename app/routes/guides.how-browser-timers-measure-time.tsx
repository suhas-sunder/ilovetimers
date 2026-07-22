import type { Route } from "./+types/guides.how-browser-timers-measure-time";
import { Link } from "react-router";
import {
  GuidePage,
  GuideSection,
  SourceList,
  guideLinkClass,
  guideListClass,
  guideListItemClass,
  guideMeta,
} from "~/clients/components/guides/GuidePage";
import { GUIDES } from "~/clients/config/guides";

const GUIDE = GUIDES[2];

const SOURCES = [
  {
    title: "W3C High Resolution Time",
    href: "https://www.w3.org/TR/hr-time-3/",
    note: "requires performance.now readings with the same time origin to use a monotonic clock and never move backward",
  },
  {
    title: "HTML Standard: Timers",
    href: "https://html.spec.whatwg.org/multipage/timers.html",
    note: "defines setTimeout and setInterval as mechanisms that schedule callbacks after a delay",
  },
  {
    title: "MDN: setTimeout()",
    href: "https://developer.mozilla.org/en-US/docs/Web/API/Window/setTimeout",
    note: "documents late callbacks, event-loop delay, and throttling in inactive tabs",
  },
] as const;

export function meta({}: Route.MetaArgs) {
  return guideMeta(GUIDE);
}

export default function BrowserTimerMeasurementGuide() {
  return (
    <GuidePage
      guide={GUIDE}
      relatedPaths={[
        "/guides/browser-timers-background-tabs",
        "/guides/browser-timer-alarm-silent",
      ]}
    >
      <p>
        <strong>Short answer:</strong> a reliable browser timer treats callbacks as
        opportunities to update the screen, not as the source of truth for time.
        It records a monotonic start or target reading, then calculates the
        current elapsed or remaining duration from a fresh reading. If a callback
        is late, the next calculation absorbs the delay instead of adding drift.
      </p>
      <p>
        This distinction explains why a display can skip from 00:08 to 00:05
        after a busy or hidden period and still be more accurate than one that
        smoothly shows every number while running three seconds late.
      </p>

      <GuideSection title="Scheduling a callback is not measuring a duration">
        <p>
          <code>setTimeout()</code>, <code>setInterval()</code>, and
          <code>requestAnimationFrame()</code> tell the browser when page code
          would like another turn. That turn can be delayed by other JavaScript,
          rendering, throttling, a hidden page, a frozen page, or operating-system
          scheduling. The requested delay is not a promise that the callback
          begins at an exact millisecond.
        </p>
        <p>
          Consider a naive stopwatch that adds 100 milliseconds on every nominal
          100-millisecond interval. If one callback arrives 350 milliseconds late,
          adding only 100 milliseconds loses 250 milliseconds. Repeating this
          error produces interval drift. A reconciled stopwatch instead computes
          something equivalent to:
        </p>
        <pre className="overflow-x-auto bg-[var(--ilt-bg-subtle)] px-4 py-3 text-sm text-[var(--ilt-text-primary)]">
          <code>{`elapsed = savedElapsed + (performance.now() - startedAt)`}</code>
        </pre>
        <p>
          The callback controls how often the user sees a new value. The clock
          difference controls what that value is.
        </p>
      </GuideSection>

      <GuideSection title="Why performance.now is useful for elapsed time">
        <p>
          The High Resolution Time specification requires performance readings
          from the same time origin to use a monotonic clock. The difference
          between two chronologically recorded readings cannot be negative. That
          makes <code>performance.now()</code> well suited to measuring a duration
          within the current page.
        </p>
        <p>
          By contrast, <code>Date.now()</code> represents wall-clock time. The
          device clock can be corrected by synchronization, changed manually, or
          shifted in presentation because of timezone settings. Wall-clock time
          is appropriate when a tool must show the current date or clock time.
          A monotonic duration clock is appropriate when the question is “how
          much time passed in this page?”
        </p>
        <p>
          Monotonic does not mean laboratory-grade. Browser privacy controls can
          reduce resolution, the display refresh rate limits visible updates,
          and input, rendering, and device latency remain. It means the clock is
          designed not to jump backward during the measurement.
        </p>
      </GuideSection>

      <GuideSection title="Countdowns use a target; stopwatches use a start">
        <p>
          The production{" "}
          <Link to="/countdown-timer" className={guideLinkClass}>
            countdown timer
          </Link>{" "}
          records an end reading equal to the current monotonic reading plus the
          remaining duration. On each animation frame it sets remaining time to
          the nonnegative difference between that end and a fresh reading. When
          the difference reaches zero, it finishes once.
        </p>
        <p>
          The production{" "}
          <Link to="/stopwatch" className={guideLinkClass}>
            stopwatch
          </Link>{" "}
          records a start reading. Each update subtracts that start from the
          current monotonic reading. The shared elapsed-stopwatch hook used by
          the combined timer and study stopwatch also keeps a saved base for
          paused time, and it immediately reconciles when the document becomes
          visible again.
        </p>
        <p>
          Pausing requires capturing the current difference before clearing the
          active start. Resuming starts a new monotonic segment from that saved
          base. Reset clears both. These state transitions matter as much as the
          arithmetic because accidentally reseeding a target on every render can
          make a countdown move its own finish line.
        </p>
      </GuideSection>

      <GuideSection title="Clocks and metronomes need different sources of truth">
        <p>
          A clock page answers “what time is it now?” Its display therefore
          derives from a fresh <code>Date</code> or <code>Date.now()</code> reading
          on each tick. Adding exactly one second per callback would turn a late
          callback into a permanently slow clock. UTC and Unix displays still
          depend on the correctness of the device's system clock.
        </p>
        <p>
          Audio rhythm has another requirement. The production{" "}
          <Link to="/metronome" className={guideLinkClass}>
            metronome
          </Link>{" "}
          uses a short JavaScript look-ahead loop, but schedules individual sound
          nodes on <code>AudioContext.currentTime</code>. JavaScript wakes often
          enough to place upcoming ticks on the audio timeline. This separates
          the audio appointment from minor variation in the next interval
          callback. The visual pulse can still lag or skip under load, and the
          browser audio stack is not a certified musical timing source.
        </p>
      </GuideSection>

      <GuideSection title="What still happens during a long delay">
        <ul className={guideListClass}>
          <li className={guideListItemClass}>
            A reconciled display jumps to the current value rather than replaying
            every missed intermediate frame.
          </li>
          <li className={guideListItemClass}>
            Completion code cannot run while the page is frozen or discarded,
            even if the mathematical target has passed.
          </li>
          <li className={guideListItemClass}>
            A sound scheduled only when JavaScript notices completion can be late
            or absent after a lifecycle interruption.
          </li>
          <li className={guideListItemClass}>
            A closed page loses in-memory monotonic state unless that particular
            tool deliberately saves enough information to restore it.
          </li>
          <li className={guideListItemClass}>
            A page reload creates a new performance time origin, so old raw
            performance readings are not portable across reloads.
          </li>
        </ul>
      </GuideSection>

      <GuideSection title="How to judge a browser timer claim">
        <p>
          Ask which clock is used, what state is recorded, how late callbacks are
          reconciled, what happens after visibility changes, and whether the
          claim concerns mathematical duration, display refresh, audio delivery,
          or an external time authority. “Shows milliseconds” describes display
          formatting. It does not by itself establish millisecond measurement
          accuracy.
        </p>
        <p>
          iLoveTimers uses browser timing for practical everyday tools. It does
          not claim official atomic synchronization, laboratory measurement, or
          guaranteed background execution. The implementation choices reduce
          ordinary callback drift while preserving those limits honestly.
        </p>
      </GuideSection>

      <SourceList sources={SOURCES} />
    </GuidePage>
  );
}
