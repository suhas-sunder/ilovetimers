/* eslint-disable react/no-unescaped-entities */

import { Link, type MetaFunction } from "react-router";
import {
  ContentPage,
  ContentSection,
} from "~/clients/components/ui/foundation";
import { AnalyticsPreferenceControls } from "~/clients/components/analytics/AnalyticsConsent";

export const meta: MetaFunction = () => {
  const canonical = "https://www.ilovetimers.com/cookies";

  const title = "Cookie Policy | iLoveTimers";
  const description =
    "Read how iLoveTimers uses browser storage, analytics consent, and PostHog persistence when analytics is allowed.";

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
      description="Last reviewed July 14, 2026"
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
          support them, and the analytics consent choice.
        </p>
        <p>
          The analytics consent choice is stored under{" "}
          <code>ilt-analytics-consent</code> with an explicit value of{" "}
          <code>allowed</code> or <code>declined</code>. Missing or invalid
          values are treated safely and do not enable analytics.
        </p>
      </ContentSection>

      <ContentSection title="PostHog analytics storage">
        <p>
          PostHog analytics is initialized only when analytics is configured and
          your saved choice allows analytics. In that allowed state, PostHog may
          use localStorage persistence for analytics identifiers and consent
          status. iLoveTimers configures PostHog to avoid cookie-based
          persistence where supported by the SDK.
        </p>
        <p>
          If you decline analytics, PostHog capture is stopped and the timers,
          stopwatches, clocks, alarms, and calculators continue to work.
        </p>
      </ContentSection>

      <ContentSection title="Analytics preferences">
        <p>
          You can change your analytics choice here. Clearing browser storage
          may reset this preference and other saved tool settings.
        </p>
        <AnalyticsPreferenceControls />
      </ContentSection>

      <ContentSection title="Advertising cookies">
        <p>
          iLoveTimers does not currently install live advertising code or
          third-party advertising scripts. The homepage may contain quiet
          "Advertisements" placeholders, but those placeholders are not live ads
          and do not set advertising cookies.
        </p>
      </ContentSection>

      <ContentSection title="Browser controls">
        <p>
          You can clear or block cookies and site storage through your browser
          settings. Doing so may reset theme preferences, saved timer/tool state,
          or analytics preferences, but the core tools are designed to remain
          usable.
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
