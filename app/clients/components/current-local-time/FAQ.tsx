import { JsonLd } from "./HowItWorks";

/* =========================================================
   FAQ (SEO + UX)
   Schema: FAQPage (tool page)
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
  // Current Local Time defaults
  const defaults: FaqItem[] = [
    {
      question: "What does this Current Local Time page do?",
      answer:
        "It shows your current local time in a big, readable clock. You can toggle seconds, switch 12/24-hour format, go fullscreen for distance viewing, and copy the current time with the date and ISO week number.",
    },
    {
      question: "Is this showing my exact location or tracking me?",
      answer:
        "No. It does not use GPS or collect your location. “Local time” is based on your device/browser time and timezone settings.",
    },
    {
      question: "How do I toggle seconds and 12/24-hour time?",
      answer:
        "Use the Seconds and 24-hour toggles above the clock. You can also use keyboard shortcuts: S toggles seconds, 1 switches to 12-hour, and 2 switches to 24-hour.",
    },
    {
      question: "How does fullscreen work?",
      answer:
        "Fullscreen makes the clock fill the screen with large digits for distance viewing. Press F (or click Fullscreen) to enter or exit, and Esc to exit. In fullscreen, you can tap/click the time to copy.",
    },
    {
      question: "What does Copy include?",
      answer:
        "Copy puts the current time on your clipboard along with the selected zone label, the full date, and the ISO week number so you can paste a complete timestamp into notes, agendas, or logs.",
    },
    {
      question: "Why does the copied text mention a week number?",
      answer:
        "The week number is the ISO week of the year (weeks start on Monday). It’s included so pasted timestamps work well for weekly reporting and planning.",
    },
    {
      question: "What are the quick-compare cities and tiles for?",
      answer:
        "They let you quickly switch the main display to another city (for example Toronto, New York, or London) and see additional city times as tiles so you can coordinate across time zones without doing conversions by hand.",
    },
    {
      question:
        "Why might the time look wrong compared with another device or website?",
      answer:
        "This page follows your device’s clock and timezone settings. If your device time, timezone, or daylight-saving settings are incorrect, the displayed time will be incorrect. Fixing your device settings will fix the display here.",
    },
    {
      question: "Does this page save anything or require an account?",
      answer:
        "No account is required. The clock runs locally in your browser and does not need sign-in. Refreshing the page simply reloads the display.",
    },
    {
      question: "What should I use if I need something different?",
      answer:
        "Use World Clock for many cities at once, UTC Clock for a dedicated UTC display, and Time Zone Converter when you need to convert a specific time between zones.",
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

      <h2 className="text-2xl font-semibold text-sky-700">{title}</h2>

      <div className="mt-4 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white shadow-sm">
        {faqs.map((f) => (
          <details key={f.question}>
            <summary className="cursor-pointer px-5 py-4 font-medium text-slate-900 hover:bg-slate-50">
              {f.question}
            </summary>
            <div className="px-5 pb-4 leading-relaxed text-slate-700">
              {/* Keep answers as plain text for schema consistency.
                  If you later want clickable links, pass custom items via props. */}
              {f.answer}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
