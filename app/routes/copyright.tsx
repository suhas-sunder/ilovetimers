import type { Route } from "./+types/copyright";
import { Link } from "react-router";
import {
  ContentPage,
  ContentSection,
} from "~/clients/components/ui/foundation";

const SITE_URL = "https://www.ilovetimers.com";
const PAGE_URL = `${SITE_URL}/copyright`;
const CONTACT_EMAIL = "admin@ilovetimers.com";

const linkClass =
  "ilt-focus-ring cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-[var(--ilt-border-strong)] underline-offset-4 hover:decoration-[var(--ilt-accent)]";

export function meta({}: Route.MetaArgs) {
  const title = "Copyright and Content Concerns | iLoveTimers";
  const description =
    "Learn how to report a copyright or content concern involving iLoveTimers tools, text, images, or other site material.";

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

export default function CopyrightConcerns() {
  return (
    <ContentPage
      title="Copyright and Content Concerns"
      description="Use this page to report copyright concerns or other content issues involving iLoveTimers."
    >
      <ContentSection title="Original tools and content">
        <p>
          iLoveTimers aims to publish original browser tools and original
          explanatory content for timers, clocks, stopwatches, alarms,
          converters, and time calculators.
        </p>
      </ContentSection>

      <ContentSection title="How to report a concern">
        <p>
          If you believe material on iLoveTimers infringes your rights, email{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className={linkClass}>
            {CONTACT_EMAIL}
          </a>
          . You can also start from the{" "}
          <Link to="/contact" className={linkClass}>
            contact page
          </Link>
          .
        </p>

        <p>A useful report should include:</p>

        <ul className="space-y-2 pl-5">
          <li className="list-disc">The relevant iLoveTimers URL</li>
          <li className="list-disc">The specific material at issue</li>
          <li className="list-disc">Your contact information</li>
          <li className="list-disc">
            An explanation of the claimed ownership or authorization
          </li>
          <li className="list-disc">
            Any context that helps identify the original work or concern
          </li>
        </ul>
      </ContentSection>

      <ContentSection title="Review process">
        <p>
          iLoveTimers will review sufficiently detailed reports. The same
          contact path may also be used for general content concerns,
          corrections, outdated statements, or mistakes in explanatory text.
        </p>

        <p>
          This page is a practical reporting path. It is not a formal registered
          agent listing and does not publish a physical mailing address or phone
          number.
        </p>
      </ContentSection>
    </ContentPage>
  );
}
