/* eslint-disable react/no-unescaped-entities */

import type { Route } from "./+types/privacy";
import { Link } from "react-router";
import {
  ContentPage,
  ContentSection,
} from "~/clients/components/ui/foundation";
import { AnalyticsPreferenceControls } from "~/clients/components/analytics/AnalyticsConsent";

export const meta: Route.MetaFunction = () => {
  const canonical = "https://www.ilovetimers.com/privacy";

  const title = "Privacy Policy | iLoveTimers";
  const description =
    "Read how iLoveTimers handles browser-stored preferences, privacy-limited analytics, contact messages, and user-entered timer or calculator data.";

  const ogImage = "https://www.ilovetimers.com/og-image.png";

  return [
    { title },
    { name: "description", content: description },

    { tagName: "link", rel: "canonical", href: canonical },

    { property: "og:site_name", content: "iLoveTimers" },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { property: "og:url", content: canonical },
    { property: "og:image", content: ogImage },
    { property: "og:image:alt", content: "iLoveTimers privacy policy" },
    { property: "og:locale", content: "en_US" },

    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: ogImage },

    { name: "robots", content: "noindex,follow" },
  ];
};

export default function PrivacyPolicy() {
  return (
    <ContentPage
      title="Privacy Policy"
      description="Last reviewed July 21, 2026"
      className="ilt-legal-doc"
    >
      <ContentSection title="Overview">
        <p>
          iLoveTimers is a browser-based timing and calculation site. The tools
          are designed to run without an account, subscription, checkout, or
          paid plan.
        </p>
        <p>
          Most timer settings, theme choices, saved sessions, and calculator
          values are handled in your browser. The site does not intentionally
          send typed timer names, alarm labels, study notes, timesheet entries,
          calculator inputs, typed dates, or saved session contents to analytics.
        </p>
      </ContentSection>

      <ContentSection title="Information you provide directly">
        <p>
          If you email iLoveTimers or use the contact information on the{" "}
          <Link to="/contact">Contact page</Link>, the message may include your
          email address and whatever details you choose to send. For bug reports,
          helpful details can include the affected page URL, browser and device,
          what you expected, what happened instead, and steps to reproduce.
        </p>
      </ContentSection>

      <ContentSection title="Browser storage">
        <p>
          iLoveTimers uses browser storage such as localStorage for preferences
          and tool state. Examples include the light/dark theme choice, timer
          settings, saved tool sessions on pages that support them, and the
          analytics consent choice.
        </p>
        <p>
          Clearing browser storage may reset those preferences. Declining
          analytics does not disable the timers, stopwatches, clocks, alarms,
          or calculators.
        </p>
      </ContentSection>

      <ContentSection title="Share links and named presets">
        <p>
          Selected tools can create a versioned setup link. The chosen timer
          duration, timing options, date, time zones, or work window are written
          into that link so another browser can reproduce the setup. Anyone who
          receives the link, and services involved in transporting or requesting
          it, can read those URL settings. Setup links do not include preset
          names, notes, history, elapsed or remaining time, running state, alarm
          state, or account information.
        </p>
        <p>
          The Countdown Timer, Pomodoro Timer, HIIT Timer, and Time Zone Meeting
          Planner can save up to 20 named presets per tool in localStorage. A
          preset contains its name and that tool's validated setup fields. These
          presets stay in the current browser profile, are not synchronized to an
          iLoveTimers account or cloud service, and can be renamed or deleted on
          the tool page. Clearing this site's browser data also removes them.
        </p>
        <p>
          Opening a shared setup does not create a named preset. The Time Zone
          Converter also avoids replacing its saved preferences merely because a
          shared link was opened. iLoveTimers does not intentionally include
          setup URL parameters, preset names, or preset values in analytics
          events.
        </p>
      </ContentSection>

      <ContentSection title="Astronomy location data">
        <p>
          The Astronomical Clock can store a latitude, longitude, and selected
          IANA time zone in the localStorage entry named astroClockPrefs. It
          uses those values to restore your chosen location after a refresh.
          The route's solar and lunar
          calculations run in the page, and its code does not send the stored
          coordinates to an astronomy service, place them in the URL, or add
          them to analytics events. Press Clear location on that route to remove
          the saved latitude and longitude. The time zone remains as a display
          preference. Clearing this site's browser data removes all three.
        </p>
        <p>
          The Sunrise &amp; Sunset Clock works differently. It does not save
          coordinates in localStorage. It sends the selected latitude,
          longitude, and calendar date to{" "}
          <a
            href="https://api.sunrise-sunset.org/"
            target="_blank"
            rel="noreferrer"
          >
            api.sunrise-sunset.org
          </a>{" "}
          to retrieve calculated sunrise and sunset timestamps. If you choose
          Device location, the browser asks for permission before supplying the
          coordinates. You can use manual coordinates instead.
        </p>
      </ContentSection>

      <ContentSection title="PostHog analytics">
        <p>
          iLoveTimers uses PostHog analytics only after the applicable analytics
          consent choice allows it and only when analytics is configured for the
          environment. Analytics is used to understand high-level site usage,
          such as which pages are viewed and whether privacy-safe tool actions
          like starting a timer or opening fullscreen are working.
        </p>
        <p>
          The current implementation manually tracks page views with the route
          path only. Query strings and URL fragments are not intentionally sent.
          Autocapture, session recording, surveys, product tours, performance
          capture, person profiles, and external PostHog dependency loading are
          disabled in code.
        </p>
        <p>
          PostHog may still receive ordinary technical request information
          involved in delivering analytics, such as browser, device, network, or
          approximate location information handled by PostHog and its
          infrastructure. iLoveTimers does not claim that analytics is
          anonymous.
        </p>
      </ContentSection>

      <ContentSection title="Analytics choice">
        <p>
          You can allow or decline analytics. If you decline, tools remain fully
          usable and analytics capture is stopped. You can change the choice
          here or from the Cookies page or footer.
        </p>
        <AnalyticsPreferenceControls />
      </ContentSection>

      <ContentSection title="Advertising">
        <p>
          iLoveTimers does not currently install live advertising code or
          third-party advertising scripts. The homepage may show quiet
          "Advertisements" placeholders to reserve possible future ad space, but
          those placeholders are not live ads and do not set advertising cookies.
        </p>
      </ContentSection>

      <ContentSection title="External links">
        <p>
          iLoveTimers may link to external sites, including Suhas Sunder's{" "}
          <Link to="https://www.suhassunder.com/">portfolio</Link> and{" "}
          <Link to="https://www.linkedin.com/in/s-sunder/">LinkedIn profile</Link>.
          Those sites are separate from iLoveTimers and have their own privacy
          practices.
        </p>
      </ContentSection>

      <ContentSection title="Contact">
        <p>
          For privacy questions, corrections, or data-related concerns, email{" "}
          <a href="mailto:admin@ilovetimers.com">admin@ilovetimers.com</a> or
          use the <Link to="/contact">Contact page</Link>.
        </p>
      </ContentSection>
    </ContentPage>
  );
}
