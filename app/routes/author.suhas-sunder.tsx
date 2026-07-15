import type { Route } from "./+types/author.suhas-sunder";
import { Link } from "react-router";
import {
  ContentPage,
  ContentSection,
} from "~/clients/components/ui/foundation";
import suhasImageUrl from "~/clients/assets/images/suhas.jpg";
import {
  SUHAS_SUNDER_PERSON_ID,
  WEBSITE_ID,
} from "~/clients/lib/siteIdentity";

const SITE_URL = "https://www.ilovetimers.com";
const PAGE_PATH = "/author/suhas-sunder";
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`;
const PROFILE_IMAGE_URL = `${SITE_URL}${suhasImageUrl}`;
const CREATOR_PORTFOLIO_URL = "https://www.suhassunder.com/";
const CREATOR_LINKEDIN_URL = "https://www.linkedin.com/in/s-sunder/";
const UPDATED_DATE = "2026-07-14";
const UPDATED_LABEL = "July 14, 2026";

const linkClass =
  "ilt-focus-ring cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-[var(--ilt-border-strong)] underline-offset-4 hover:decoration-[var(--ilt-accent)]";

export function meta({}: Route.MetaArgs) {
  const title = "Suhas Sunder | Creator of iLoveTimers";
  const description =
    "Learn about Suhas Sunder, the software engineer who created and maintains iLoveTimers and its browser-based timers, clocks, stopwatches, and time tools.";

  return [
    { title },
    { name: "description", content: description },
    { name: "robots", content: "index,follow,max-image-preview:large" },
    { property: "og:site_name", content: "iLoveTimers" },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: "profile" },
    { property: "og:url", content: PAGE_URL },
    { property: "og:image", content: PROFILE_IMAGE_URL },
    { property: "og:image:alt", content: "Suhas Sunder, creator of iLoveTimers" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: PROFILE_IMAGE_URL },
    { tagName: "link", rel: "canonical", href: PAGE_URL },
    { name: "theme-color", content: "#ffffff" },
  ];
}

export default function SuhasSunderAuthorPage() {
  const description =
    "Suhas Sunder is a software engineer with a bachelor's degree in Engineering and a master's degree in Electrical and Computer Engineering. He builds production web applications and focused browser utilities, and created and maintains iLoveTimers.";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "@id": `${PAGE_URL}#profile-page`,
    name: "Suhas Sunder | Creator of iLoveTimers",
    url: PAGE_URL,
    dateModified: UPDATED_DATE,
    isPartOf: {
      "@id": WEBSITE_ID,
    },
    mainEntity: {
      "@type": "Person",
      "@id": SUHAS_SUNDER_PERSON_ID,
      name: "Suhas Sunder",
      url: PAGE_URL,
      image: PROFILE_IMAGE_URL,
      jobTitle: "Software Engineer",
      description,
      sameAs: [CREATOR_PORTFOLIO_URL, CREATOR_LINKEDIN_URL],
    },
  };

  return (
    <ContentPage
      title="Suhas Sunder"
      description="Software engineer, creator and maintainer of iLoveTimers."
      meta={
        <span>
          <Link to="/" className={linkClass}>
            Home
          </Link>{" "}
          /{" "}
          <Link to="/about" className={linkClass}>
            About
          </Link>{" "}
          / Suhas Sunder
        </span>
      }
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="grid gap-6 md:grid-cols-[12rem_minmax(0,1fr)] md:items-start">
        <img
          src={suhasImageUrl}
          alt="Suhas Sunder, creator of iLoveTimers"
          width={360}
          height={360}
          className="h-auto w-32 max-w-full md:w-44"
        />

        <div className="space-y-4 leading-7 text-[var(--ilt-text-secondary)]">
          <p>
            Suhas Sunder is a software engineer with a bachelor's degree in
            Engineering and a master's degree in Electrical and Computer
            Engineering. He builds production web applications and focused
            browser utilities.
          </p>

          <p>
            He created and maintains iLoveTimers, including its tool interfaces,
            browser-based timing workflows, calculator behavior, documentation,
            accessibility improvements, and ongoing corrections.
          </p>
        </div>
      </section>

      <ContentSection title="Work on iLoveTimers">
        <p>
          Suhas is responsible for the practical product direction of
          iLoveTimers: how each timer, clock, stopwatch, alarm, converter, or
          calculator should behave, what assumptions should be visible, and how
          the interface can stay fast and readable without unnecessary clutter.
        </p>

        <ul className="space-y-2 pl-5">
          <li className="list-disc">Tool and interface design</li>
          <li className="list-disc">Browser-based timer and clock workflows</li>
          <li className="list-disc">Calculator behavior and assumptions</li>
          <li className="list-disc">Documentation and explanatory content</li>
          <li className="list-disc">Accessibility and usability improvements</li>
          <li className="list-disc">Maintenance, corrections, and updates</li>
        </ul>
      </ContentSection>

      <ContentSection title="Background">
        <p>
          Suhas is a software engineer with a bachelor's degree in Engineering
          and a master's degree in Electrical and Computer Engineering. This
          page intentionally keeps the biography concise and limited to details
          that are relevant to maintaining iLoveTimers.
        </p>
      </ContentSection>

      <ContentSection title="Elsewhere">
        <p>
          You can learn more about Suhas through his{" "}
          <a
            href={CREATOR_PORTFOLIO_URL}
            className={linkClass}
            rel="noreferrer"
            target="_blank"
          >
            portfolio
          </a>{" "}
          and{" "}
          <a
            href={CREATOR_LINKEDIN_URL}
            className={linkClass}
            rel="noreferrer"
            target="_blank"
          >
            LinkedIn profile
          </a>
          .
        </p>

        <p>
          Related site pages:{" "}
          <Link to="/about" className={linkClass}>
            About iLoveTimers
          </Link>
          ,{" "}
          <Link to="/contact" className={linkClass}>
            Contact
          </Link>
          , and{" "}
          <Link to="/how-ilovetimers-is-made" className={linkClass}>
            How iLoveTimers Is Made
          </Link>
          .
        </p>
      </ContentSection>

      <p className="text-sm text-[var(--ilt-text-muted)]">
        Last updated {UPDATED_LABEL}.
      </p>
    </ContentPage>
  );
}
