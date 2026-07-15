import type { Route } from "./+types/how-ilovetimers-is-made";
import { Link } from "react-router";
import {
  ContentPage,
  ContentSection,
} from "~/clients/components/ui/foundation";

const SITE_URL = "https://www.ilovetimers.com";
const PAGE_URL = `${SITE_URL}/how-ilovetimers-is-made`;

const linkClass =
  "ilt-focus-ring cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-[var(--ilt-border-strong)] underline-offset-4 hover:decoration-[var(--ilt-accent)]";

export function meta({}: Route.MetaArgs) {
  const title = "How iLoveTimers Is Made";
  const description =
    "Learn how iLoveTimers builds and maintains its browser-based timers, clocks, stopwatches, alarms, calculators, documentation, and corrections.";

  return [
    { title },
    { name: "description", content: description },
    { name: "robots", content: "index,follow,max-image-preview:large" },
    { property: "og:site_name", content: "iLoveTimers" },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { property: "og:url", content: PAGE_URL },
    { property: "og:image", content: `${SITE_URL}/og-image.png` },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { tagName: "link", rel: "canonical", href: PAGE_URL },
    { name: "theme-color", content: "#ffffff" },
  ];
}

export default function HowILoveTimersIsMade() {
  return (
    <ContentPage
      title="How iLoveTimers Is Made"
      description="A practical note on how iLoveTimers approaches browser-based timing tools, explanations, limitations, and corrections."
    >
      <ContentSection title="Who maintains the site">
        <p>
          iLoveTimers is created and maintained by{" "}
          <Link to="/author/suhas-sunder" className={linkClass}>
            Suhas Sunder
          </Link>
          , a software engineer. You can also read the broader{" "}
          <Link to="/about" className={linkClass}>
            About iLoveTimers
          </Link>{" "}
          page.
        </p>
      </ContentSection>

      <ContentSection title="How browser timing tools work">
        <p>
          iLoveTimers uses different implementations for different tools.
          Depending on the page, timers and stopwatches use browser timing APIs
          with elapsed-time or target-time reconciliation, live clocks display
          time derived from the user's device or system clock, timezone tools
          use browser-supported timezone data and formatting, alarms and
          metronomes use browser audio capabilities, and calculator pages use
          explicit formulas and assumptions.
        </p>

        <p>
          Not every route uses one identical technical approach. A stopwatch, a
          countdown timer, a world clock, a Unix timestamp converter, and a
          weekly timesheet calculator have different jobs, so their behavior and
          limitations should be described where they matter.
        </p>
      </ContentSection>

      <ContentSection title="Accuracy boundaries">
        <p>
          Browser timing is suitable for practical everyday use, but display
          precision is not the same as certified measurement accuracy.
          Millisecond displays can be affected by display refresh, rendering,
          browser scheduling, and device performance.
        </p>

        <ul className="space-y-2 pl-5">
          <li className="list-disc">
            Atomic-style clocks are not official atomic time sources unless an
            external synchronization source is explicitly implemented.
          </li>
          <li className="list-disc">
            Current UTC and Unix values inherit the correctness of the user's
            device or system clock.
          </li>
          <li className="list-disc">
            Browser alarms can be affected by permissions, tab closure,
            throttling, muted audio, and device sleep.
          </li>
          <li className="list-disc">
            Timezone and date tools may have daylight-saving, date-boundary,
            weekend, holiday, or inclusion assumptions that should be shown on
            the relevant page.
          </li>
        </ul>
      </ContentSection>

      <ContentSection title="Content and documentation">
        <p>
          Explanatory content should match the actual tool, describe real use
          cases, avoid filler and keyword stuffing, disclose meaningful
          limitations, and be corrected when behavior or guidance changes.
        </p>

        <p>
          Development and drafting tools may assist the workflow, but changes
          are reviewed against the actual iLoveTimers implementation before
          publication.
        </p>
      </ContentSection>

      <ContentSection title="Corrections">
        <p>
          Users can report incorrect explanations, unexpected results, broken
          controls, accessibility problems, or outdated statements through the{" "}
          <Link to="/contact" className={linkClass}>
            contact page
          </Link>
          . Useful reports include the page URL, browser and device, what was
          expected, what happened instead, and steps to reproduce the problem
          when known.
        </p>
      </ContentSection>

      <ContentSection title="What iLoveTimers does not claim to be">
        <p>
          iLoveTimers is not an official time standards body, certified
          synchronization service, medical service, payroll or accounting
          service, or legal service.
        </p>
      </ContentSection>

      <ContentSection title="Relevant links">
        <p>
          <Link to="/author/suhas-sunder" className={linkClass}>
            Author
          </Link>
          ,{" "}
          <Link to="/about" className={linkClass}>
            About
          </Link>
          ,{" "}
          <Link to="/contact" className={linkClass}>
            Contact
          </Link>
          ,{" "}
          <Link to="/privacy" className={linkClass}>
            Privacy
          </Link>
          ,{" "}
          <Link to="/terms" className={linkClass}>
            Terms
          </Link>
          , and{" "}
          <Link to="/copyright" className={linkClass}>
            Copyright
          </Link>
          .
        </p>
      </ContentSection>
    </ContentPage>
  );
}
