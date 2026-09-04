/* eslint-disable react/no-unescaped-entities */

import { Link, type MetaFunction } from "react-router";
import {
  ContentPage,
  ContentSection,
} from "~/clients/components/ui/foundation";

export const meta: MetaFunction = () => {
  const canonical = "https://www.ilovetimers.com/cookies";

  const title = "Cookie Policy | iLoveTimers";
  const description =
    "Read how iLoveTimers uses local browser storage, cookieless PostHog analytics, and Google advertising cookies on eligible pages.";

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
    { property: "og:image:alt", content: "iLoveTimers cookie policy" },
    { property: "og:locale", content: "en_US" },

    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: ogImage },

    { name: "robots", content: "noindex,follow" },
  ];
};

export default function CookiesPolicy() {
  return (
    <ContentPage
      title="Cookie Policy"
      description="Last reviewed September 3, 2026"
      className="ilt-legal-doc"
    >
      <ContentSection title="Overview">
        <p>
          This page explains the cookies and similar browser storage used by
          iLoveTimers. The site is built around browser-based timers, clocks,
          alarms, stopwatches, and calculators that work without an account.
        </p>
      </ContentSection>

      <ContentSection title="Local browser storage">
        <p>
          Many iLoveTimers features use localStorage or similar browser storage
          so preferences can persist on the same browser. This can include the
          theme choice, timer settings, saved sessions or history on tools that
          support them, and named presets on tools that provide that feature.
        </p>
      </ContentSection>

      <ContentSection title="Cookieless PostHog analytics">
        <p>
          When analytics is configured, iLoveTimers runs PostHog in its always-on
          cookieless mode with in-memory-only, disabled persistence. This setup
          does not create PostHog cookies or PostHog entries in localStorage,
          sessionStorage, or IndexedDB. It also does not store an analytics
          consent choice or show a PostHog consent banner.
        </p>
        <p>
          Analytics is limited in code to manual page views and a restricted set
          of tool events. Query strings, URL fragments, typed labels, notes,
          dates, durations, timesheet values, and other user-entered values are
          not intentionally included. Analytics failures do not disable the
          timers, stopwatches, clocks, alarms, or calculators.
        </p>
      </ContentSection>

      <ContentSection title="Advertising cookies">
        <p>
          On eligible tool, guide, and homepage routes, iLoveTimers uses Google
          AdSense. Google and its advertising partners may place or read cookies,
          use web beacons, and process IP addresses or similar request information
          to deliver, limit, personalize where permitted, and measure ads.
          AdSense is not loaded on trust, legal, contact, sitemap, or the archived
          four-timer route.
        </p>
        <p>
          Google may use advertising cookies to serve ads based on visits to this
          site and other sites. You can manage personalized advertising in{" "}
          <a href="https://adssettings.google.com/">Google Ads Settings</a>{" "}
          and read{" "}
          <a href="https://policies.google.com/technologies/partner-sites">
            how Google uses information from partner sites
          </a>
          . Where required, Google Privacy &amp; Messaging may present a regional
          consent or opt-out message before eligible advertising is served.
        </p>
        <p>
          When every ad unit is confirmed unfilled, the page may display static,
          non-interactive placeholders labeled "Advertisements." Those fallback
          elements do not themselves make an advertising request or store data.
        </p>
      </ContentSection>

      <ContentSection title="Browser controls">
        <p>
          You can clear or block cookies and site storage through your browser
          settings. Doing so may reset theme preferences, saved timer/tool state,
          or named presets, but the core tools are designed to remain usable.
        </p>
      </ContentSection>

      <ContentSection title="More information">
        <p>
          Read the <Link to="/privacy">Privacy Policy</Link> for the broader
          data-handling explanation. For questions, email{" "}
          <a href="mailto:admin@ilovetimers.com">admin@ilovetimers.com</a> or
          use the <Link to="/contact">Contact page</Link>.
        </p>
      </ContentSection>
    </ContentPage>
  );
}
