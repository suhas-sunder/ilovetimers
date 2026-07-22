import type { Route } from "./+types/guides.browser-timer-alarm-silent";
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

const GUIDE = GUIDES[1];

const SOURCES = [
  {
    title: "MDN: Autoplay guide for media and Web Audio APIs",
    href: "https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay",
    note: "explains that browsers can block audible playback until the user has interacted with the page",
  },
  {
    title: "Web Audio API specification",
    href: "https://webaudio.github.io/web-audio-api/",
    note: "defines suspended, running, interrupted, and closed audio-context states and the user-agent rule for allowing a context to start",
  },
  {
    title: "Chrome for Developers: Page Lifecycle API",
    href: "https://developer.chrome.com/docs/web-platform/page-lifecycle-api",
    note: "documents that frozen and discarded pages cannot run ordinary JavaScript callbacks",
  },
] as const;

export function meta({}: Route.MetaArgs) {
  return guideMeta(GUIDE);
}

export default function BrowserAlarmSilentGuide() {
  return (
    <GuidePage
      guide={GUIDE}
      relatedPaths={[
        "/guides/browser-timers-background-tabs",
        "/guides/how-browser-timers-measure-time",
      ]}
    >
      <p>
        <strong>Short answer:</strong> a timer can reach zero correctly while its
        sound is blocked, muted, suspended, interrupted, delayed, or routed to an
        output you cannot hear. Browser audio is a separate capability from time
        measurement. A visible “finished” state proves the countdown completed;
        it does not prove the browser or operating system delivered an audible
        signal.
      </p>
      <p>
        Start with the simplest test: while the page is visible, click its sound
        test or start control, then check the site, tab, system, and hardware
        volume layers. A direct click matters because browser autoplay policies
        often require user interaction before audible Web Audio is allowed.
      </p>

      <GuideSection title="The six separate points where sound can fail">
        <ol className="space-y-3 pl-5">
          <li className="list-decimal">
            <strong>The tool setting.</strong> Sound may be turned off inside the
            timer, or an alarm may have been stopped before you expected it.
          </li>
          <li className="list-decimal">
            <strong>Browser permission or autoplay policy.</strong> A browser may
            create an audio context in a suspended state and refuse to start it
            until a user gesture has activated the page.
          </li>
          <li className="list-decimal">
            <strong>The tab or site.</strong> The tab can be muted, the site can
            have sound restricted, or the tab can be closed before completion.
          </li>
          <li className="list-decimal">
            <strong>The operating system.</strong> Master volume, per-app volume,
            focus modes, an interrupted audio session, or silent settings can
            suppress output.
          </li>
          <li className="list-decimal">
            <strong>The output route.</strong> Sound may be going to Bluetooth
            headphones, a monitor, a dock, another speaker, or an unavailable
            device.
          </li>
          <li className="list-decimal">
            <strong>Page lifecycle.</strong> A frozen, discarded, sleeping, or
            terminated page cannot reliably schedule and deliver the alert.
          </li>
        </ol>
      </GuideSection>

      <GuideSection title="Why clicking Test sound is more useful than waiting">
        <p>
          The production online alarm clock exposes a Test sound action. Its
          handler creates or reuses an <code>AudioContext</code>, asks a suspended
          context to resume, and schedules short oscillator tones. The alarm
          timer uses the same Web Audio pattern. The metronome starts from a user
          action, awaits <code>resume()</code> when necessary, and schedules ticks
          against the audio context clock.
        </p>
        <p>
          A direct test answers several questions at once: the page is visible,
          the user gesture is current, the browser has a chance to allow audio,
          the selected output can be heard, and the tool's sound setting is in a
          known state. If the test is silent, waiting for a future completion is
          unlikely to fix the underlying path.
        </p>
        <p>
          Use the{" "}
          <Link to="/online-alarm-clock" className={guideLinkClass}>
            online alarm clock
          </Link>{" "}
          when you need an alarm at a clock time, or the{" "}
          <Link to="/alarm-timer" className={guideLinkClass}>
            alarm timer
          </Link>{" "}
          for a duration. Test sound in the same browser and device setup you
          plan to use.
        </p>
      </GuideSection>

      <GuideSection title="What suspended, interrupted, and closed audio mean">
        <p>
          The Web Audio specification gives an audio context several states. In
          a <strong>suspended</strong> context, audio time is not progressing and
          processing is paused. Page code can call <code>resume()</code>, but the
          browser may allow that transition only when its user-activation policy
          is satisfied. In an <strong>interrupted</strong> state, the user agent or
          operating system has interrupted output. In a <strong>closed</strong>
          state, the context has released its resources and cannot resume.
        </p>
        <p>
          An iLoveTimers beep helper requests a resume if the context reports
          suspended. That is a reasonable recovery attempt, not a way to bypass
          browser policy. The helper also catches audio construction and resume
          failures so a blocked sound does not crash the timer interface. This
          means the timer can continue visually even when sound is unavailable.
        </p>
      </GuideSection>

      <GuideSection title="Background tabs and locked devices add another risk">
        <p>
          Inactive pages can receive delayed JavaScript callbacks. A frozen page
          does not start freezable tasks, and a discarded page runs no JavaScript
          at all. Mobile operating systems may also suspend browser processes or
          audio when the screen locks. Even if elapsed-time reconciliation shows
          zero after you return, the original completion moment has passed.
        </p>
        <p>
          Keeping the tab open is necessary but not always sufficient. For an
          important alert, keep the page visible, keep the device awake, leave
          power-saving modes out of the path when possible, and use a native
          alarm as a backup. iLoveTimers does not claim to replace an
          operating-system alarm, emergency alert, or safety device.
        </p>
      </GuideSection>

      <GuideSection title="Troubleshooting checklist">
        <ul className={guideListClass}>
          <li className={guideListItemClass}>
            Click Test sound or Start while the page is visible.
          </li>
          <li className={guideListItemClass}>
            Confirm the tool's sound toggle is on and the alarm has not already
            been stopped.
          </li>
          <li className={guideListItemClass}>
            Unmute the tab and allow sound for the site if your browser exposes
            those controls.
          </li>
          <li className={guideListItemClass}>
            Check master and per-application volume, silent or focus modes, and
            the currently selected speaker or headphones.
          </li>
          <li className={guideListItemClass}>
            Disconnect an unexpected Bluetooth output or select the intended
            output device.
          </li>
          <li className={guideListItemClass}>
            Keep the tab open, the browser running, and the device awake.
          </li>
          <li className={guideListItemClass}>
            If sound still fails, reload the page, interact again, and repeat the
            short test before starting a long timer.
          </li>
        </ul>
      </GuideSection>

      <GuideSection title="What a successful browser test does not prove">
        <p>
          Hearing a test tone proves that audio worked during that interaction.
          It does not guarantee that the same page will remain active for hours,
          survive a device lock, keep the same output route, or avoid a later
          interruption. Browser, OS, and hardware state can change after the
          test. For low-stakes everyday use, that limitation is usually
          manageable. For a deadline that must not be missed, use a second alert
          mechanism.
        </p>
      </GuideSection>

      <SourceList sources={SOURCES} />
    </GuidePage>
  );
}
