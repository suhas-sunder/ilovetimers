import { JsonLd } from "./HowItWorks";

/* =========================================================
   5) FAQ (SEO + UX)
   Schema: FAQPage (use on homepage or tool pages)
========================================================= */
export type FaqItem = {
  question: string;
  answer: string;
};

export default function FAQ({
  items,
  id = "faq",
  title = "Frequently Asked Questions",
}: {
  items?: FaqItem[];
  id?: string;
  title?: string;
}) {
  // Astronomical-clock defaults (location + timezone + sunrise/sunset + moon phase + fullscreen)
  const defaults: FaqItem[] = [
    {
      question: "What does this astronomical clock show?",
      answer:
        "It shows live local time for the selected time zone, a day or night status based on the sun’s position, today’s sunrise and sunset (when coordinates are provided), plus a moon phase label and an illumination estimate.",
    },
    {
      question: "Do I need to share my location?",
      answer:
        "No. You can use the clock without location access. Location (or manual coordinates) is only needed to compute sunrise, sunset, and the daylight or twilight labels for your chosen position.",
    },
    {
      question: "How do I get sunrise and sunset times?",
      answer:
        "Add coordinates by clicking “Use my location” or by entering latitude and longitude manually. Once coordinates are set, sunrise and sunset are computed for the selected time zone’s local date.",
    },
    {
      question: "Why are sunrise and sunset showing “—”?",
      answer:
        "Sunrise and sunset require coordinates. If coordinates are missing, they stay blank. In some locations and dates near the poles, there may be no sunrise or no sunset for that day, so the page will show no event times.",
    },
    {
      question:
        "What does Daylight vs Civil/Nautical/Astronomical twilight mean?",
      answer:
        "Those labels are based on the sun’s estimated altitude at your coordinates. Daylight means the sun is above the horizon, and twilight phases indicate how far below the horizon it is. The label can change quickly around sunrise and sunset.",
    },
    {
      question: "Which time zone is used?",
      answer:
        "You can choose Device time, UTC, or a preset time zone. Sunrise and sunset are displayed in the selected time zone and are calculated for that time zone’s local date, so switching time zones can shift which day’s events you see.",
    },
    {
      question: "How accurate is the moon phase and illumination?",
      answer:
        "The moon phase label and illumination are a solid approximation for everyday use. Small differences from astronomy apps are normal, especially near phase boundaries (like around First Quarter or Full Moon).",
    },
    {
      question: "How do I use fullscreen mode?",
      answer:
        "Click Fullscreen (or press F after clicking the clock card once). Fullscreen must be initiated by a user gesture and may be limited on some mobile browsers. Press Esc to exit.",
    },
    {
      question: "Why can the display look less smooth sometimes?",
      answer:
        "Browsers can throttle timers and animations in background tabs, low-power modes, or during screen sharing. Keep the tab visible for the smoothest updates.",
    },
    {
      question: "Can I use this for different cities without sharing location?",
      answer:
        "Yes. Use the example presets (like New York, Toronto, London) to quickly load coordinates and a matching time zone, or manually enter coordinates for any place.",
    },
    {
      question: "Does it keep running if I close the tab?",
      answer:
        "No. It runs in your browser while this page is open. If you close the tab or browser, it stops.",
    },
    {
      question: "Does this work offline?",
      answer:
        "If the page is already loaded and your browser keeps it open, it can continue showing time and updating the display without a network connection. Refreshing the page may require connectivity depending on your setup.",
    },
  ];

  const faqs = items?.length ? items : defaults;

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };

  return (
    <section id={id} className="mx-auto max-w-7xl px-4 pb-6">
      <JsonLd data={faqLd} />

      <h2 className="text-2xl font-semibold text-[var(--ilt-text-primary)]">{title}</h2>

      <div className="mt-4 divide-y divide-[var(--ilt-border-subtle)]">
        {faqs.map((f) => (
          <details key={f.question}>
            <summary className="cursor-pointer px-5 py-4 font-medium text-[var(--ilt-text-primary)] hover:bg-[var(--ilt-bg-hover)]">
              {f.question}
            </summary>
            <div className="px-5 pb-4 text-[var(--ilt-text-secondary)] leading-relaxed">
              {/* Keep answers as plain text for schema consistency.
                  If you later want clickable links, pass custom items via props. */}
              {f.answer}
            </div>
          </details>
        ))}
      </div>

      {/* Note: Answers avoid clickable links for schema consistency.
         If you want links to existing routes (moon-phase-clock, sunrise-sunset-clock, world-clock, time-zone-converter),
         pass custom `items` from the page and render <Link/> there instead. */}
    </section>
  );
}
