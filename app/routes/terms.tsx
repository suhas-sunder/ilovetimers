/* eslint-disable react/no-unescaped-entities */

import type { Route } from "./+types/terms";
import { Link } from "react-router";
import {
  ContentPage,
  ContentSection,
} from "~/clients/components/ui/foundation";

export const meta: Route.MetaFunction = () => {
  const canonical = "https://www.ilovetimers.com/terms";

  const title = "Terms of Service | iLoveTimers";
  const description =
    "Read the iLoveTimers Terms of Service for browser-based timers, clocks, alarms, stopwatches, calculators, and time tools.";

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
    { property: "og:image:alt", content: "iLoveTimers terms of service" },
    { property: "og:locale", content: "en_US" },

    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: ogImage },

    { name: "robots", content: "noindex,follow" },
  ];
};

export default function TermsOfService() {
  return (
    <ContentPage
      title="Terms of Service"
      description="Last reviewed July 14, 2026"
      className="ilt-legal-doc"
    >
      <ContentSection title="Agreement to these terms">
        <p>
          These Terms of Service apply to your access to and use of
          iLoveTimers at https://www.ilovetimers.com. By using the site, you
          agree to these terms. If you do not agree, please do not use the site.
        </p>
        <p>
          iLoveTimers currently provides free browser-based timers, clocks,
          stopwatches, alarms, calculators, converters, and related time tools.
          The site does not currently offer public accounts, subscriptions,
          paid plans, merchandise, checkout, or Stripe/payment processing.
        </p>
      </ContentSection>

      <ContentSection title="Use of the tools">
        <p>
          The tools are provided for practical everyday timing, planning, study,
          cooking, meetings, workouts, reference, and calculation workflows.
          You are responsible for deciding whether a tool is suitable for your
          situation and for checking important results before relying on them.
        </p>
        <p>
          You may not misuse the site, interfere with its operation, attempt to
          bypass security or access controls, scrape or copy the site at scale
          without permission, remove copyright notices, or use the site in a way
          that violates applicable law.
        </p>
      </ContentSection>

      <ContentSection title="Accuracy and browser limitations">
        <p>
          iLoveTimers is not an official time standards body, certified
          synchronization service, medical service, payroll provider, legal
          service, or accounting service. Browser timers, clocks, alarms, and
          calculators can be affected by device settings, system time, browser
          scheduling, permissions, background throttling, tab closure, device
          sleep, display refresh, and page-specific assumptions.
        </p>
        <p>
          Calculator pages may use assumptions described on the relevant page,
          such as break handling, rounding, weekends, holidays, date inclusion,
          or timezone behavior. Verify important work, payroll, financial,
          legal, medical, or safety-sensitive decisions with an appropriate
          source or professional.
        </p>
      </ContentSection>

      <ContentSection title="Intellectual property">
        <p>
          The site design, text, tool interfaces, source code, graphics, and
          other materials on iLoveTimers are owned by iLoveTimers or used with
          permission, unless otherwise noted. You may access and use the site
          for personal, classroom, work, and ordinary internal reference use.
        </p>
        <p>
          Do not copy, republish, resell, frame, or exploit substantial portions
          of the site or its content without written permission. To report a
          copyright or content concern, use the{" "}
          <Link to="/copyright">Copyright page</Link>.
        </p>
      </ContentSection>

      <ContentSection title="Feedback and corrections">
        <p>
          If you send iLoveTimers a bug report, correction, suggestion, or other
          feedback, you confirm that you have the right to send it and that
          iLoveTimers may use it to operate, maintain, correct, and improve the
          site without owing compensation to you.
        </p>
      </ContentSection>

      <ContentSection title="Third-party links">
        <p>
          iLoveTimers may link to third-party websites, such as portfolio,
          LinkedIn, policy, browser, or reference pages. Those sites are not
          controlled by iLoveTimers and may have their own terms and privacy
          practices.
        </p>
      </ContentSection>

      <ContentSection title="Privacy and cookies">
        <p>
          Please read the <Link to="/privacy">Privacy Policy</Link> and{" "}
          <Link to="/cookies">Cookie Policy</Link> for information about
          browser storage and cookieless PostHog analytics. Analytics failures
          do not prevent the tools from working.
        </p>
      </ContentSection>

      <ContentSection title="Availability and changes">
        <p>
          iLoveTimers is provided on an "as is" and "as available" basis. The
          site may change, pause, or stop offering particular tools or content,
          and it may contain errors, omissions, bugs, or interruptions. We may
          correct or update content and tools without prior notice.
        </p>
      </ContentSection>

      <ContentSection title="Disclaimer and limitation of liability">
        <p>
          To the fullest extent permitted by law, iLoveTimers disclaims
          warranties, express or implied, related to the site and your use of
          it. iLoveTimers will not be liable for indirect, incidental,
          consequential, special, exemplary, or punitive damages arising from
          your use of the site.
        </p>
      </ContentSection>

      <ContentSection title="Contact">
        <p>
          To resolve a question or concern about these terms, email{" "}
          <a href="mailto:admin@ilovetimers.com">admin@ilovetimers.com</a> or
          use the <Link to="/contact">Contact page</Link>.
        </p>
      </ContentSection>
    </ContentPage>
  );
}
