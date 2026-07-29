import type { Route } from "./+types/guides.browser-storage";
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

const GUIDE = GUIDES[5];

const SOURCES = [
  {
    title: "HTML Standard: Web storage",
    href: "https://html.spec.whatwg.org/multipage/webstorage.html",
    note: "defines origin-scoped localStorage and sessionStorage, storage failures, and browser controls for deleting stored data",
  },
  {
    title: "MDN: Window.localStorage",
    href: "https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage",
    note: "explains that local storage is origin-specific, can persist across browser sessions, and may be unavailable because of browser policy",
  },
  {
    title: "WHATWG Storage Standard",
    href: "https://storage.spec.whatwg.org/",
    note: "defines origin-based storage keys, quotas, and user-agent storage policy used by web storage",
  },
  {
    title: "iLoveTimers Privacy Policy",
    href: "https://www.ilovetimers.com/privacy",
    note: "states the site's current user-facing data and analytics practices",
  },
] as const;

export function meta({}: Route.MetaArgs) {
  return guideMeta(GUIDE);
}

export default function BrowserStorageGuide() {
  return (
    <GuidePage
      guide={GUIDE}
      relatedPaths={[
        "/guides/browser-timers-background-tabs",
        "/guides/daylight-saving-time-zone-conversions",
      ]}
    >
      <p>
        <strong>Short answer:</strong> iLoveTimers uses this site's
        origin-scoped <code>localStorage</code> for the selected theme and saved
        data on a limited set of tools. Many timer values, stopwatch laps, and
        session results exist only in page memory. Cookieless analytics does not
        add browser-storage entries. The site does not require an account, and
        locally saved tool data is not the same as a cloud backup.
      </p>
      <p>
        Local storage usually survives a reload and later browser session on the
        same browser profile. It can still be blocked, cleared, partitioned, or
        removed by private-browsing rules, site-data controls, storage pressure,
        browser policy, or the user. iLoveTimers catches storage failures so its
        core tools can fall back instead of requiring persistence.
      </p>

      <GuideSection title="The production local-storage inventory">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[52rem] border-collapse text-left text-sm">
            <caption className="sr-only">
              iLoveTimers local storage keys and the information stored in each
            </caption>
            <thead className="bg-[var(--ilt-bg-subtle)] text-[var(--ilt-text-primary)]">
              <tr>
                <th className="px-3 py-2 font-bold">Feature</th>
                <th className="px-3 py-2 font-bold">Key or keys</th>
                <th className="px-3 py-2 font-bold">Stored information</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th className="px-3 py-2 align-top font-semibold">Theme</th>
                <td className="px-3 py-2 align-top font-mono">ilt-theme-mode</td>
                <td className="px-3 py-2 align-top">Light or dark choice</td>
              </tr>
              <tr>
                <th className="px-3 py-2 align-top font-semibold">Astronomical clock</th>
                <td className="px-3 py-2 align-top font-mono">astroClockPrefs</td>
                <td className="px-3 py-2 align-top">
                  Selected timezone and, when supplied, latitude and longitude
                </td>
              </tr>
              <tr className="bg-[var(--ilt-bg-subtle)]/50">
                <th className="px-3 py-2 align-top font-semibold">BPM tapper</th>
                <td className="px-3 py-2 align-top font-mono">
                  bpmTapper.settings.v1, bpmTapper.history.v1
                </td>
                <td className="px-3 py-2 align-top">
                  Reset, hold, and keyboard settings plus up to ten recent results
                </td>
              </tr>
              <tr>
                <th className="px-3 py-2 align-top font-semibold">Billable-hours clock</th>
                <td className="px-3 py-2 align-top font-mono">
                  ilovetimers:billable-hours-clock:v1
                </td>
                <td className="px-3 py-2 align-top">
                  Timer names, notes, rates, currency, rounding, status, and elapsed state
                </td>
              </tr>
              <tr className="bg-[var(--ilt-bg-subtle)]/50">
                <th className="px-3 py-2 align-top font-semibold">Event countdown</th>
                <td className="px-3 py-2 align-top font-mono">
                  ilovetimers:event-countdown:v1
                </td>
                <td className="px-3 py-2 align-top">
                  Saved event names, target local date-times, sound choices, and selection
                </td>
              </tr>
              <tr>
                <th className="px-3 py-2 align-top font-semibold">Meeting agenda timer</th>
                <td className="px-3 py-2 align-top font-mono">
                  ilt-meeting-agenda-timer-items
                </td>
                <td className="px-3 py-2 align-top">Agenda item titles and durations</td>
              </tr>
              <tr className="bg-[var(--ilt-bg-subtle)]/50">
                <th className="px-3 py-2 align-top font-semibold">Multiple timers</th>
                <td className="px-3 py-2 align-top font-mono">
                  ilovetimers:multiple-timers:v2
                </td>
                <td className="px-3 py-2 align-top">
                  Labels, durations, saved remaining values, and sound settings;
                  restored timers are paused
                </td>
              </tr>
              <tr>
                <th className="px-3 py-2 align-top font-semibold">Time-blocking clock</th>
                <td className="px-3 py-2 align-top font-mono">
                  ilovetimers:time-blocking-clock:v2
                </td>
                <td className="px-3 py-2 align-top">
                  Block titles, times, notes, and live-display choice
                </td>
              </tr>
              <tr className="bg-[var(--ilt-bg-subtle)]/50">
                <th className="px-3 py-2 align-top font-semibold">Timezone converter</th>
                <td className="px-3 py-2 align-top font-mono">
                  ilovetimers:time-zone-converter:v1
                </td>
                <td className="px-3 py-2 align-top">
                  Source and destination zones, date, time, and seconds-display choice
                </td>
              </tr>
              <tr>
                <th className="px-3 py-2 align-top font-semibold">Speedcubing settings</th>
                <td className="px-3 py-2 align-top font-mono">
                  sc_start_mode, sc_auto_save, sc_max_solves
                </td>
                <td className="px-3 py-2 align-top">
                  Start mode, add-on-stop choice, and maximum session-result setting
                </td>
              </tr>
              <tr className="bg-[var(--ilt-bg-subtle)]/50">
                <th className="px-3 py-2 align-top font-semibold">Named tool presets</th>
                <td className="px-3 py-2 align-top font-mono">
                  ilovetimers:presets:countdown-timer:v1,
                  ilovetimers:presets:pomodoro-timer:v1,
                  ilovetimers:presets:hiit-timer:v1,
                  ilovetimers:presets:time-zone-meeting-planner:v1
                </td>
                <td className="px-3 py-2 align-top">
                  Up to 20 names and validated reusable setup records per
                  supported tool. Active, running, elapsed, and remaining state
                  is excluded.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          This inventory comes from direct <code>localStorage</code> reads and
          writes in the production application. Version suffixes are part of the
          keys. A later implementation may migrate a format rather than reading
          an incompatible older value.
        </p>
      </GuideSection>

      <GuideSection title="What stays only in the current page session">
        <p>
          Most React state is in memory unless a route explicitly writes it to
          storage. The basic countdown's active monotonic target, ordinary
          stopwatch elapsed time and laps, reaction-test rounds, alarm runtime
          state, and many form values disappear when the page reloads or closes.
          Saving a named preset on a supported tool stores only its reusable
          setup, not its active countdown or current phase.
        </p>
        <p>
          The speedcubing timer makes the distinction visible: its three settings
          persist, while solve results and averages remain in page memory and are
          cleared by refresh or closure. The multiple-timers route saves labels,
          configured durations, and the last remaining values, but intentionally
          restores them paused rather than pretending the page kept running.
        </p>
      </GuideSection>

      <GuideSection title="Share links are different from local presets">
        <p>
          The Countdown Timer, Pomodoro Timer, HIIT Timer, Time Zone Converter,
          and Time Zone Meeting Planner can represent selected settings in a
          versioned URL. That URL is not local storage. Anyone with the link, and
          services involved in transporting or requesting it, can read its date,
          duration, timing, work-window, or timezone settings. The links exclude
          arbitrary labels, notes, history, current phase, running state,
          remaining time, alarm state, and preset names.
        </p>
        <p>
          Opening a shared setup leaves the tool stopped or ready and does not
          create a preset. The Time Zone Converter does not replace its saved
          preferences just because a setup link was opened. Named presets are
          explicit localStorage records on the four tools listed in the
          inventory. They remain local to the browser profile unless the browser
          itself moves or synchronizes site data.
        </p>
      </GuideSection>

      <GuideSection title="Local storage is origin-scoped, not a server account">
        <p>
          The browser gives each origin a separate local storage area. Data saved
          for the HTTPS iLoveTimers origin is available to scripts running on
          that origin in the same browser profile. Unlike cookies, local-storage
          values are not automatically attached to every web request. Page code
          can still read and use them, so notes, labels, rates, and coordinates
          should be treated as information stored on that browser, not as an
          encrypted vault.
        </p>
        <p>
          There is no iLoveTimers account synchronization. Opening the site in a
          different browser, profile, device, or private window normally starts
          with separate storage. Clearing browser site data removes saved values
          and preferences. Browser import, profile sync, enterprise policy, or
          backup behavior belongs to the browser environment and is not controlled
          by iLoveTimers.
        </p>
      </GuideSection>

      <GuideSection title="What happens when storage is missing or corrupt">
        <p>
          Storage APIs can throw when persistence is disabled, restricted, or out
          of quota. The theme and tool implementations wrap reads and writes in
          error handling. Missing or invalid theme data defaults to light.
          Several JSON-backed tools validate a version and expected fields before
          restoring; malformed data is ignored or replaced with safe defaults.
          The astronomical clock removes a corrupt preference entry.
          Named preset stores validate the root version, tool identifier, schema
          version, name length, timestamps, and route-owned configuration. A bad
          record is ignored without discarding valid sibling records. Older
          version-1 preset roots are rewritten in the current shape after the
          next successful preset change.
        </p>
        <p>
          Validation is intentionally route-specific because an agenda, a timer
          list, and a timezone preference have different shapes. A fallback means
          the tool remains usable. It does not recover the overwritten or cleared
          value. Export important billable or planning information before clearing
          site data if you need to retain it elsewhere.
        </p>
      </GuideSection>

      <GuideSection title="Cookieless analytics does not persist browser state">
        <p>
          When analytics is configured, the PostHog client starts in always-on
          cookieless mode with persistence disabled and memory selected as its
          only storage backend. It does not create PostHog cookies or entries in
          localStorage, sessionStorage, or IndexedDB. Session recording,
          autocapture, surveys, feature flags, experiments, and person profiles
          are disabled, and manual events use a restricted property list.
        </p>
        <p>
          The current data-handling statement is on the{" "}
          <Link to="/privacy" className={guideLinkClass}>
            Privacy Policy
          </Link>{" "}
          and{" "}
          <Link to="/cookies" className={guideLinkClass}>
            Cookies Policy
          </Link>
          . The previous analytics consent and PostHog consent entries are
          removed during startup when found.
        </p>
      </GuideSection>

      <GuideSection title="How to clear or preserve your data">
        <ul className={guideListClass}>
          <li className={guideListItemClass}>
            Use a tool's own clear action when it provides one, such as clearing
            BPM history or using Delete all for that tool's named presets. This
            is narrower than clearing all site data.
          </li>
          <li className={guideListItemClass}>
            Use browser site-data controls for ilovetimers.com to remove all
            local preferences and saved tool state for that origin.
          </li>
          <li className={guideListItemClass}>
            Expect theme, event, agenda, timer, timezone, and other locally saved
            choices to return to defaults after a full clear.
          </li>
          <li className={guideListItemClass}>
            Copy or export information you need before clearing. Local storage is
            convenient persistence, not a durable backup format.
          </li>
        </ul>
      </GuideSection>

      <SourceList sources={SOURCES} />
    </GuidePage>
  );
}
