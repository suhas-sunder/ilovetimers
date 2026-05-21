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
  // Analog-clock defaults (fullscreen + seconds hand + smooth + timezone + accuracy)
  const defaults: FaqItem[] = [
    {
      question: "What does this analog clock show?",
      answer:
        "It shows your device’s current local time on a clean analog clock face. You can go fullscreen for wall display use and optionally show a seconds hand.",
    },
    {
      question: "How do I use fullscreen mode?",
      answer:
        "Click Fullscreen (or press F after clicking the clock card once). Fullscreen must be initiated by a user gesture and may be limited on some mobile browsers. Press Esc to exit.",
    },
    {
      question: "How do I hide the seconds hand?",
      answer:
        "Toggle “Seconds hand” off in the controls, or press S after focusing the clock card. This can also reduce distraction for classrooms or presentations.",
    },
    {
      question: "What does “Smooth” do?",
      answer:
        "Smooth makes the seconds hand move fluidly rather than stepping once per second. It can use more CPU, so if you’re projecting on an older device, try turning Smooth off.",
    },
    {
      question: "Why isn’t the seconds hand perfectly smooth sometimes?",
      answer:
        "Browsers can throttle animations in background tabs, low-power modes, or during screen sharing/recording. Keeping the tab visible and disabling heavy capture can help.",
    },
    {
      question: "Which timezone does it use?",
      answer:
        "It uses your device’s timezone setting. If the time looks wrong, check your operating system’s timezone and automatic time settings. For multi-timezone viewing, use the World Clock.",
    },
    {
      question: "Is this an “atomic” clock?",
      answer:
        "No. This page displays the time your device reports. If you want a reference aligned to an atomic time source, use the Atomic Clock page.",
    },
    {
      question: "Does it keep running if I close the tab?",
      answer:
        "No. It runs in your browser while this page is open. If you close the tab or browser, it stops.",
    },
    {
      question: "Are there keyboard shortcuts?",
      answer:
        "Yes. Click the clock card once, then use: F fullscreen • S seconds hand • M smooth.",
    },
    {
      question: "What are good alternatives if I want a different style?",
      answer:
        "If you want a numeric display, use Digital Clock. If you want an ultra-clean face, use Minimalist Clock. If you want multiple cities/timezones, use World Clock.",
    },
    {
      question: "Does this work offline?",
      answer:
        "If the page is already loaded and your browser keeps it open, the clock can continue displaying local time without a network connection. Refreshing the page may require connectivity depending on your setup.",
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
    <section id={id} className="space-y-4">
      <JsonLd data={faqLd} />

      <h2 className="text-2xl font-semibold text-[var(--ilt-text-primary)]">{title}</h2>

      <div className="mt-4 divide-y divide-[var(--ilt-border-subtle)] ilt-surface-card">
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

      {/* Note: Answers mention other tools by name; if you want them clickable,
         provide `items` from the page and render <Link/> there instead. */}
    </section>
  );
}
