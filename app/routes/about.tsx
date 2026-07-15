import type { Route } from "./+types/about";
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
const PAGE_PATH = "/about";
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`;
const AUTHOR_PATH = "/author/suhas-sunder";
const PROFILE_IMAGE_URL = `${SITE_URL}${suhasImageUrl}`;
const CREATOR_PORTFOLIO_URL = "https://www.suhassunder.com/";
const CREATOR_LINKEDIN_URL = "https://www.linkedin.com/in/s-sunder/";

const linkClass =
  "ilt-focus-ring cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-[var(--ilt-border-strong)] underline-offset-4 hover:decoration-[var(--ilt-accent)]";

export function meta({}: Route.MetaArgs) {
  const title = "About iLoveTimers";
  const description =
    "Learn what iLoveTimers is, who created and maintains it, and how its browser-based timers, clocks, stopwatches, alarms, and time tools are approached.";

  return [
    { title },
    { name: "description", content: description },
    { name: "robots", content: "index,follow,max-image-preview:large" },
    { property: "og:site_name", content: "iLoveTimers" },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
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

export default function About() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "AboutPage",
        "@id": `${PAGE_URL}#about-page`,
        name: "About iLoveTimers",
        url: PAGE_URL,
        description:
          "Information about iLoveTimers, its creator, and its approach to browser-based timing tools.",
        isPartOf: {
          "@id": WEBSITE_ID,
        },
        about: {
          "@id": SUHAS_SUNDER_PERSON_ID,
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: `${SITE_URL}/`,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "About",
            item: PAGE_URL,
          },
        ],
      },
    ],
  };

  return (
    <ContentPage
      title="About iLoveTimers"
      description="iLoveTimers is an independent collection of practical browser-based timers, clocks, stopwatches, alarms, converters, and time calculators."
      meta={
        <span>
          <Link to="/" className={linkClass}>
            Home
          </Link>{" "}
          / About
        </span>
      }
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="grid gap-6 md:grid-cols-[minmax(0,1fr)_12rem] md:items-start">
        <div className="space-y-4 leading-7 text-[var(--ilt-text-secondary)]">
          <p>
            iLoveTimers exists to make everyday time tools fast to open, clear
            to use, and free from unnecessary account flows or marketing clutter.
            The site is built around practical jobs: starting a countdown,
            running a stopwatch, checking a clock, setting an alarm, converting
            time values, or calculating dates and work hours.
          </p>

          <p>
            The goal is not to make the site feel like a content hub. The useful
            part should be the tool itself: readable displays, clear controls,
            helpful fullscreen support where it makes sense, short instructions,
            and honest notes about browser and device limitations.
          </p>
        </div>

        <img
          src={suhasImageUrl}
          alt="Suhas Sunder, creator of iLoveTimers"
          width={360}
          height={360}
          className="h-auto w-32 max-w-full md:w-44"
        />
      </section>

      <ContentSection title="Who created and maintains iLoveTimers">
        <p>
          <Link to={AUTHOR_PATH} className={linkClass}>
            Suhas Sunder
          </Link>{" "}
          is a software engineer with a bachelor's degree in Engineering and a
          master's degree in Electrical and Computer Engineering. He builds
          production web applications and focused browser-based tools, and
          created iLoveTimers to provide practical timers, clocks, stopwatches,
          alarms, and time calculators that work directly in the browser.
        </p>

        <p>
          Suhas's work on iLoveTimers includes tool and interface design,
          browser-based timer and clock workflows, calculator behavior and
          assumptions, explanatory content, accessibility and usability review,
          maintenance, and corrections.
        </p>

        <p>
          You can also visit his{" "}
          <a
            href={CREATOR_PORTFOLIO_URL}
            className={linkClass}
            rel="noreferrer"
            target="_blank"
          >
            portfolio
          </a>{" "}
          or{" "}
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
      </ContentSection>

      <ContentSection title="What the site is designed to do">
        <p>
          iLoveTimers aims to provide fast browser-based tools with no account
          requirement, clear controls, readable displays, fullscreen support
          where useful, clear instructions, and limitation notes that help users
          understand what the tool can and cannot do.
        </p>

        <ul className="space-y-2 pl-5">
          <li className="list-disc">
            Timers, stopwatches, clocks, alarms, and calculators should be ready
            to use without a setup ritual.
          </li>
          <li className="list-disc">
            Supporting content should explain real behavior, real assumptions,
            and practical use cases.
          </li>
          <li className="list-disc">
            The site should stay focused on utility rather than generic
            marketing, filler, or doorway-style pages.
          </li>
        </ul>
      </ContentSection>

      <ContentSection title="Limits of browser-based time tools">
        <p>
          Browser tools are useful for everyday timing, planning, studying,
          meetings, cooking, workouts, and reference. They still depend on the
          browser, device, operating system, and settings around them.
        </p>

        <ul className="space-y-2 pl-5">
          <li className="list-disc">
            Many clocks depend on the user's device and system clock.
          </li>
          <li className="list-disc">
            Browser scheduling, display refresh, and device performance can
            affect how a timer or millisecond display appears.
          </li>
          <li className="list-disc">
            Browser alarms can be affected by permissions, background
            throttling, tab closure, muted audio, and device sleep.
          </li>
          <li className="list-disc">
            Calculator pages may use assumptions described on the relevant page,
            such as weekend rules, break handling, rounding, or inclusive date
            counting.
          </li>
          <li className="list-disc">
            iLoveTimers is not an official standards body, certified time
            source, medical service, payroll provider, legal service, or
            accounting service.
          </li>
        </ul>
      </ContentSection>

      <ContentSection title="Corrections and contact">
        <p>
          If a tool behaves unexpectedly, a calculator result looks wrong, an
          explanation needs correction, or an accessibility issue gets in the
          way, please use the{" "}
          <Link to="/contact" className={linkClass}>
            contact page
          </Link>
          . Reports are most useful when they include the affected page URL, the
          browser and device, what you expected, what happened instead, and the
          steps to reproduce the issue when known.
        </p>

        <p>
          For more on how tools and explanations are approached, read{" "}
          <Link to="/how-ilovetimers-is-made" className={linkClass}>
            How iLoveTimers Is Made
          </Link>
          . Privacy, terms, and site policy information are available in the{" "}
          <Link to="/privacy" className={linkClass}>
            Privacy Policy
          </Link>{" "}
          and{" "}
          <Link to="/terms" className={linkClass}>
            Terms of Service
          </Link>
          .
        </p>
      </ContentSection>
    </ContentPage>
  );
}
