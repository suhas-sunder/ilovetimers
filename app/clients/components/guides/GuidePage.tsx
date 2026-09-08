import { Children, type ReactNode } from "react";
import { Link } from "react-router";
import {
  ContentPage,
  ContentSection,
} from "~/clients/components/ui/foundation";
import {
  BelowHeaderAd,
  SeoSectionAd,
} from "~/clients/components/ads/AdSense";
import {
  GUIDE_REVIEW_DATE,
  GUIDE_REVIEW_DATE_LABEL,
  GUIDES,
  type GuideDefinition,
} from "~/clients/config/guides";
import {
  SITE_URL,
  SUHAS_SUNDER_PERSON_ID,
  WEBSITE_ID,
} from "~/clients/lib/siteIdentity";

export const guideLinkClass =
  "ilt-focus-ring cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-[var(--ilt-border-strong)] underline-offset-4 hover:decoration-[var(--ilt-accent)]";

export const guideListClass = "space-y-2 pl-5";
export const guideListItemClass = "list-disc";

export function guideMeta(guide: GuideDefinition) {
  const pageUrl = `${SITE_URL}${guide.path}`;
  const title = `${guide.title} | iLoveTimers`;

  return [
    { title },
    { name: "description", content: guide.description },
    { name: "robots", content: "index,follow,max-image-preview:large" },
    { property: "og:site_name", content: "iLoveTimers" },
    { property: "og:title", content: title },
    { property: "og:description", content: guide.description },
    { property: "og:type", content: "article" },
    { property: "og:url", content: pageUrl },
    { property: "article:published_time", content: GUIDE_REVIEW_DATE },
    { property: "article:modified_time", content: GUIDE_REVIEW_DATE },
    { name: "twitter:card", content: "summary" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: guide.description },
    { tagName: "link", rel: "canonical", href: pageUrl },
    { name: "theme-color", content: "#ffffff" },
  ];
}

export function GuidePage({
  guide,
  children,
  relatedPaths,
}: {
  guide: GuideDefinition;
  children: ReactNode;
  relatedPaths: readonly string[];
}) {
  const pageUrl = `${SITE_URL}${guide.path}`;
  const relatedGuides = relatedPaths
    .map((path) => GUIDES.find((candidate) => candidate.path === path))
    .filter((candidate): candidate is (typeof GUIDES)[number] => Boolean(candidate));
  const guideSections = Children.toArray(children);
  const adIndex = Math.min(
    guideSections.length,
    Math.max(1, Math.ceil(guideSections.length / 2)),
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "TechArticle",
        "@id": `${pageUrl}#article`,
        headline: guide.title,
        description: guide.description,
        url: pageUrl,
        mainEntityOfPage: pageUrl,
        datePublished: `${GUIDE_REVIEW_DATE}T00:00:00Z`,
        dateModified: `${GUIDE_REVIEW_DATE}T00:00:00Z`,
        inLanguage: "en",
        author: { "@id": SUHAS_SUNDER_PERSON_ID },
        isPartOf: { "@id": WEBSITE_ID },
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
            item: `${SITE_URL}/guides`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: guide.shortTitle,
            item: pageUrl,
          },
        ],
      },
    ],
  };

  return (
    <ContentPage
      title={guide.title}
      description={guide.description}
      meta={
        <div className="space-y-2">
          <div>
            <Link to="/" className={guideLinkClass}>
              Home
            </Link>{" "}
            /{" "}
            <Link to="/guides" className={guideLinkClass}>
              Guides
            </Link>{" "}
            / {guide.shortTitle}
          </div>
          <div>
            Written by{" "}
            <Link to="/author/suhas-sunder" className={guideLinkClass}>
              Suhas Sunder
            </Link>
            {" · "}Published {GUIDE_REVIEW_DATE_LABEL}
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

      <ContentSection title={guide.directQuestion}>
        {guideSections.slice(0, adIndex)}
        <div className="py-8 sm:py-10">
          <SeoSectionAd />
        </div>
        {guideSections.slice(adIndex)}
      </ContentSection>

      <ContentSection title="Related iLoveTimers guides">
        <ul className={guideListClass}>
          {relatedGuides.map((relatedGuide) => (
            <li key={relatedGuide.path} className={guideListItemClass}>
              <Link to={relatedGuide.path} className={guideLinkClass}>
                {relatedGuide.title}
              </Link>
            </li>
          ))}
        </ul>
        <p>
          Read how these explanations are checked on{" "}
          <Link to="/how-ilovetimers-is-made" className={guideLinkClass}>
            How iLoveTimers Is Made
          </Link>
          , or report a problem through the{" "}
          <Link to="/contact" className={guideLinkClass}>
            contact page
          </Link>
          .
        </p>
      </ContentSection>
    </ContentPage>
  );
}

export function GuideSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="pt-5">
      <h2 className="text-xl font-bold tracking-tight text-[var(--ilt-text-primary)] sm:text-2xl">
        {title}
      </h2>
      <div className="mt-3 space-y-3 leading-7 text-[var(--ilt-text-secondary)]">
        {children}
      </div>
    </section>
  );
}

export function SourceList({
  sources,
}: {
  sources: readonly { title: string; href: string; note: string }[];
}) {
  return (
    <GuideSection title="Sources and further reading">
      <p>
        These external references support the browser and standards behavior
        described above. iLoveTimers implementation details are identified
        separately in the guide.
      </p>
      <ul className={guideListClass}>
        {sources.map((source) => (
          <li key={source.href} className={guideListItemClass}>
            <a
              href={source.href}
              className={guideLinkClass}
              rel="noreferrer"
              target="_blank"
            >
              {source.title}
            </a>
            : {source.note}
          </li>
        ))}
      </ul>
    </GuideSection>
  );
}
