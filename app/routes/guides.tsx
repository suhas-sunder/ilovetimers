import type { Route } from "./+types/guides";
import { Link } from "react-router";
import {
  ContentPage,
  ContentSection,
} from "~/clients/components/ui/foundation";
import {
  GUIDE_REVIEW_DATE,
  GUIDE_REVIEW_DATE_LABEL,
  GUIDES,
} from "~/clients/config/guides";
import { guideLinkClass } from "~/clients/components/guides/GuidePage";
import {
  BelowHeaderAd,
  SeoSectionAd,
} from "~/clients/components/ads/AdSense";
import {
  SITE_URL,
  SUHAS_SUNDER_PERSON_ID,
  WEBSITE_ID,
} from "~/clients/lib/siteIdentity";

const PAGE_URL = `${SITE_URL}/guides`;

export function meta({}: Route.MetaArgs) {
  const title = "Browser Timing, Timezone, and Storage Guides | iLoveTimers";
  const description =
    "Read implementation-backed guides to browser timer behavior, alarm sound, elapsed-time measurement, Unix timestamp units, DST conversions, and local storage.";

  return [
    { title },
    { name: "description", content: description },
    { name: "robots", content: "index,follow,max-image-preview:large" },
    { property: "og:site_name", content: "iLoveTimers" },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { property: "og:url", content: PAGE_URL },
    { name: "twitter:card", content: "summary" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { tagName: "link", rel: "canonical", href: PAGE_URL },
    { name: "theme-color", content: "#ffffff" },
  ];
}

export default function GuidesIndex() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${PAGE_URL}#collection`,
        name: "iLoveTimers Guides",
        description:
          "Implementation-backed guides to browser timing, audio, timezones, Unix timestamps, and local browser storage.",
        url: PAGE_URL,
        dateModified: GUIDE_REVIEW_DATE,
        author: { "@id": SUHAS_SUNDER_PERSON_ID },
        isPartOf: { "@id": WEBSITE_ID },
        mainEntity: {
          "@type": "ItemList",
          itemListElement: GUIDES.map((guide, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: guide.title,
            url: `${SITE_URL}${guide.path}`,
          })),
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
            name: "Guides",
            item: PAGE_URL,
          },
        ],
      },
    ],
  };

  return (
    <ContentPage
      title="Guides to Browser Timing, Timezones, and Local Data"
      description="Focused explanations of the browser behavior behind iLoveTimers tools, written from the production implementation and checked against browser standards and documentation."
      meta={
        <div className="space-y-2">
          <div>
            <Link to="/" className={guideLinkClass}>
              Home
            </Link>{" "}
            / Guides
          </div>
          <div>
            Written by{" "}
            <Link to="/author/suhas-sunder" className={guideLinkClass}>
              Suhas Sunder
            </Link>
            {" · "}Last reviewed {GUIDE_REVIEW_DATE_LABEL}
          </div>
        </div>
      }
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <BelowHeaderAd />

      <ContentSection title="Choose the question you need to answer">
        <p>
          These are not generic articles about time. Each guide starts with a
          practical question, explains the relevant browser behavior, and then
          states what the current iLoveTimers implementation does. The guides
          also identify limits that cannot be removed by page code, such as a
          closed tab, device sleep, browser audio policy, or timezone data on the
          device.
        </p>

        <ol className="space-y-6 pl-5">
          {GUIDES.map((guide) => (
            <li key={guide.path} className="list-decimal pl-2">
              <h2 className="text-lg font-bold tracking-tight text-[var(--ilt-text-primary)] sm:text-xl">
                <Link to={guide.path} className={guideLinkClass}>
                  {guide.title}
                </Link>
              </h2>
              <p className="mt-1 max-w-3xl">{guide.description}</p>
              <p className="mt-1 text-sm text-[var(--ilt-text-muted)]">
                Direct question: {guide.directQuestion}
              </p>
            </li>
          ))}
        </ol>
      </ContentSection>

      <div className="py-8 sm:py-10">
        <SeoSectionAd />
      </div>

      <ContentSection title="How these guides are checked">
        <p>
          Implementation claims are traced to route components, shared hooks,
          formulas, storage keys, and automated tests in the production
          implementation. Browser behavior claims cite standards, browser vendor
          documentation, or reference documentation. Browser checks cover
          representative behavior, but they cannot prove identical behavior in
          every browser, operating system, power state, or permission setup.
        </p>
        <p>
          For the broader review process, read{" "}
          <Link to="/how-ilovetimers-is-made" className={guideLinkClass}>
            How iLoveTimers Is Made
          </Link>
          . For site-wide data handling, read the{" "}
          <Link to="/privacy" className={guideLinkClass}>
            Privacy Policy
          </Link>
          .
        </p>
      </ContentSection>
    </ContentPage>
  );
}
