export const SITE_URL = "https://www.ilovetimers.com";
export const WEBSITE_ID = `${SITE_URL}/#website`;
export const SUHAS_SUNDER_PERSON_ID =
  "https://www.ilovetimers.com/author/suhas-sunder#person";

export const SITE_IDENTITY_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": WEBSITE_ID,
  name: "iLoveTimers",
  alternateName: "I Love Timers",
  url: `${SITE_URL}/`,
  description:
    "Free browser-based timers, stopwatches, clocks, countdowns, converters, calculators, and related time tools.",
  inLanguage: "en",
  creator: {
    "@id": SUHAS_SUNDER_PERSON_ID,
  },
} as const;
