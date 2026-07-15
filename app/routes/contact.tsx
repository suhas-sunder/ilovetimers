import type { Route } from "./+types/contact";
import { Link } from "react-router";
import {
  ContentPage,
  ContentSection,
} from "~/clients/components/ui/foundation";

const SITE_URL = "https://www.ilovetimers.com";
const PAGE_URL = `${SITE_URL}/contact`;
const CONTACT_EMAIL = "admin@ilovetimers.com";

const linkClass =
  "ilt-focus-ring cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-[var(--ilt-border-strong)] underline-offset-4 hover:decoration-[var(--ilt-accent)]";

export function meta({}: Route.MetaArgs) {
  const title = "Contact iLoveTimers";
  const description =
    "Contact iLoveTimers to report a bug, question a calculator result, request a correction, raise an accessibility issue, or share feedback.";

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

export default function Contact() {
  return (
    <ContentPage
      title="Contact iLoveTimers"
      description="Use this page to report problems, request corrections, or send feedback about iLoveTimers."
    >
      <ContentSection title="Email">
        <p>
          The contact email used for iLoveTimers is{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className={linkClass}>
            {CONTACT_EMAIL}
          </a>
          .
        </p>

        <p>
          There is no contact form in this pass. Email is the simplest way to
          send enough detail for a bug report, calculator concern, accessibility
          issue, privacy question, copyright concern, correction request, or
          general feedback.
        </p>
      </ContentSection>

      <ContentSection title="What to include in a report">
        <p>
          Useful reports usually include the affected page URL, your browser and
          device, what you expected to happen, what happened instead, and the
          steps to reproduce the issue when you know them.
        </p>

        <ul className="space-y-2 pl-5">
          <li className="list-disc">Bug reports and broken controls</li>
          <li className="list-disc">Timer, stopwatch, clock, or alarm behavior</li>
          <li className="list-disc">Calculator result concerns</li>
          <li className="list-disc">Accessibility issues</li>
          <li className="list-disc">Correction requests for explanatory text</li>
          <li className="list-disc">Privacy questions</li>
          <li className="list-disc">Copyright or content concerns</li>
          <li className="list-disc">General feedback</li>
        </ul>
      </ContentSection>

      <ContentSection title="Related pages">
        <p>
          For more context about the site, visit{" "}
          <Link to="/about" className={linkClass}>
            About iLoveTimers
          </Link>
          ,{" "}
          <Link to="/author/suhas-sunder" className={linkClass}>
            Suhas Sunder
          </Link>
          ,{" "}
          <Link to="/how-ilovetimers-is-made" className={linkClass}>
            How iLoveTimers Is Made
          </Link>
          , or{" "}
          <Link to="/copyright" className={linkClass}>
            Copyright and Content Concerns
          </Link>
          .
        </p>
      </ContentSection>
    </ContentPage>
  );
}
