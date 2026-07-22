import type { Route } from "./+types/guides.browser-timers-background-tabs";
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

const GUIDE = GUIDES[0];

const SOURCES = [
  {
    title: "Chrome for Developers: Page Lifecycle API",
    href: "https://developer.chrome.com/docs/web-platform/page-lifecycle-api",
    note: "defines hidden, frozen, terminated, and discarded page states and explains that JavaScript timers do not run while a page is frozen or discarded",
  },
  {
    title: "MDN: setTimeout()",
    href: "https://developer.mozilla.org/en-US/docs/Web/API/Window/setTimeout",
    note: "documents late callbacks and browser-specific throttling in inactive tabs",
  },
  {
    title: "MDN: Page Visibility API",
    href: "https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API",
    note: "explains how documents learn that they have become hidden or visible",
  },
] as const;

export function meta({}: Route.MetaArgs) {
  return guideMeta(GUIDE);
}

export default function BrowserTimersBackgroundGuide() {
  return (
    <GuidePage
      guide={GUIDE}
      relatedPaths={[
        "/guides/how-browser-timers-measure-time",
        "/guides/browser-timer-alarm-silent",
      ]}
    >
      <p>
        <strong>Short answer:</strong> a hidden desktop tab often keeps enough
        state for an elapsed-time timer to catch up when it becomes visible, but
        the browser may reduce callback frequency. A locked phone may suspend or
        freeze the page. A discarded or closed page runs no JavaScript at all.
        Therefore, a browser timer should not be treated like an operating-system
        alarm when missing the alert would matter.
      </p>
      <p>
        The key distinction is between <em>measuring elapsed time</em> and
        <em>continuing to execute code</em>. An iLoveTimers countdown can compare
        a stored target with a monotonic clock after a delay and show the right
        remaining duration. That does not mean the page was awake to repaint the
        display or play a sound at the exact completion moment.
      </p>

      <GuideSection title="What changes when a tab is merely hidden">
        <p>
          Switching to another tab normally changes the document visibility
          state from visible to hidden. The page may remain loaded, but browsers
          conserve power by throttling background callbacks. A callback requested
          for a particular delay is a request to run <em>no earlier</em> than that
          delay, not a guarantee of an exact appointment. A busy event loop can
          also make it late.
        </p>
        <p>
          This is why counting one second every time a one-second interval fires
          is fragile. If five callbacks are delayed, incrementing a counter only
          once would lose time. The production countdown route instead stores an
          end reading based on <code>performance.now()</code> and recomputes the
          difference on every animation frame. The stopwatch route and the
          shared elapsed-stopwatch hook use the same broad idea: elapsed time
          comes from the difference between monotonic readings, not from the
          number of paints received.
        </p>
        <p>
          When the hidden page is allowed to run again, the next calculation can
          jump directly to the current remaining or elapsed value. The display
          may appear to skip numbers because intermediate frames were never
          rendered. That visible jump is preferable to a timer that falls behind.
        </p>
      </GuideSection>

      <GuideSection title="Hidden, frozen, discarded, and closed are different states">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[42rem] border-collapse text-left text-sm">
            <caption className="sr-only">
              What browser timer users can expect in different page states
            </caption>
            <thead className="bg-[var(--ilt-bg-subtle)] text-[var(--ilt-text-primary)]">
              <tr>
                <th className="px-3 py-2 font-bold">State</th>
                <th className="px-3 py-2 font-bold">Can page code run?</th>
                <th className="px-3 py-2 font-bold">Practical timer result</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th className="px-3 py-2 align-top font-semibold">Visible</th>
                <td className="px-3 py-2 align-top">Normally yes</td>
                <td className="px-3 py-2 align-top">
                  Regular display updates and the best chance of timely audio.
                </td>
              </tr>
              <tr className="bg-[var(--ilt-bg-subtle)]/50">
                <th className="px-3 py-2 align-top font-semibold">Hidden</th>
                <td className="px-3 py-2 align-top">Often, but throttled</td>
                <td className="px-3 py-2 align-top">
                  The timer can catch up, while paints or alerts may arrive late.
                </td>
              </tr>
              <tr>
                <th className="px-3 py-2 align-top font-semibold">Frozen</th>
                <td className="px-3 py-2 align-top">Freezable tasks are suspended</td>
                <td className="px-3 py-2 align-top">
                  No JavaScript timer callbacks until the page resumes.
                </td>
              </tr>
              <tr className="bg-[var(--ilt-bg-subtle)]/50">
                <th className="px-3 py-2 align-top font-semibold">Discarded</th>
                <td className="px-3 py-2 align-top">No</td>
                <td className="px-3 py-2 align-top">
                  The page is gone from memory and must reload when revisited.
                </td>
              </tr>
              <tr>
                <th className="px-3 py-2 align-top font-semibold">Closed</th>
                <td className="px-3 py-2 align-top">No</td>
                <td className="px-3 py-2 align-top">
                  The timer page cannot finish work or make an alert.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          Chrome's lifecycle documentation states that frozen pages do not start
          freezable tasks such as JavaScript timer callbacks. A discarded page
          runs no callbacks or JavaScript at all. Discarding can happen without a
          final event, so a page cannot reliably schedule one last action before
          every discard. Other browsers and mobile operating systems have their
          own lifecycle decisions, which is why this guide avoids promising one
          universal background duration.
        </p>
      </GuideSection>

      <GuideSection title="What happens when a phone is locked">
        <p>
          Locking a phone can hide the page, suspend the browser process, freeze
          tasks, or place the device into a deeper power-saving state. The exact
          sequence depends on the browser, operating system, battery settings,
          memory pressure, and how long the phone remains locked. A page cannot
          force the operating system to keep its JavaScript and audio hardware
          active indefinitely.
        </p>
        <p>
          If the page remains in memory, a duration-based implementation may
          reconcile its display when the screen is active again. If the browser
          discarded the page, revisiting the tab is a new load. iLoveTimers does
          not register a service worker or operating-system alarm that continues
          a countdown after the active document is gone. The tool should
          therefore remain visible and the device awake for time-sensitive use.
        </p>
      </GuideSection>

      <GuideSection title="What iLoveTimers can and cannot recover">
        <ul className={guideListClass}>
          <li className={guideListItemClass}>
            The main countdown and stopwatch implementations measure against
            monotonic readings, which prevents ordinary callback delay from
            accumulating as interval drift.
          </li>
          <li className={guideListItemClass}>
            The shared stopwatch hook listens for <code>visibilitychange</code>
            and immediately reconciles elapsed time when the page becomes visible.
          </li>
          <li className={guideListItemClass}>
            Current clocks derive their display from a fresh device-clock reading
            rather than adding one nominal second per callback.
          </li>
          <li className={guideListItemClass}>
            Some tools save settings or sessions in local storage, but saving
            data is not the same as keeping code running. The basic countdown
            does not promise to restore a running countdown after closure.
          </li>
          <li className={guideListItemClass}>
            No page can play its completion sound after its document and audio
            context have been terminated.
          </li>
        </ul>
        <p>
          For a concrete duration, try the{" "}
          <Link to="/countdown-timer" className={guideLinkClass}>
            countdown timer
          </Link>
          . For elapsed measurement, use the{" "}
          <Link to="/stopwatch" className={guideLinkClass}>
            stopwatch
          </Link>
          . Keep the relevant tab open for either one.
        </p>
      </GuideSection>

      <GuideSection title="Safer setup for an important timer">
        <ol className="space-y-2 pl-5">
          <li className="list-decimal">
            Keep the timer tab open and visible where practical.
          </li>
          <li className="list-decimal">
            Prevent the device from sleeping for a time-sensitive session.
          </li>
          <li className="list-decimal">
            Test sound with a direct click before relying on an audible alert.
          </li>
          <li className="list-decimal">
            Check system volume, the selected output device, silent modes, and
            browser site permissions.
          </li>
          <li className="list-decimal">
            Use an operating-system alarm or dedicated hardware as a backup when
            a missed alert could affect safety, cooking, medication, travel, an
            exam, or another important deadline.
          </li>
        </ol>
      </GuideSection>

      <SourceList sources={SOURCES} />
    </GuidePage>
  );
}
