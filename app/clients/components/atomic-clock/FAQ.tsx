import { JsonLd } from "./HowItWorks";

/* =========================================================
   FAQ (SEO + UX)
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
  const defaults: FaqItem[] = [
    {
      question: "What does this atomic clock show?",
      answer:
        "It shows your current device time in a large, readable display. You can include milliseconds, freeze the display, and use fullscreen for a clean on-screen clock.",
    },
    {
      question: "Is this synced to an atomic time server?",
      answer:
        "No. This page uses your browser/device clock for the time source. The atomic wording describes the millisecond display style. Official references such as NIST and time.gov exist, but this page is not a certified atomic or NTP-synced service.",
    },
    {
      question: "What does atomic clock mean here?",
      answer:
        "Here it means an atomic-style online display: large digits, optional milliseconds, freeze/resume, and fullscreen. It does not mean the page guarantees official atomic-clock precision.",
    },
    {
      question: "How do I turn milliseconds on or off?",
      answer:
        "Use the Milliseconds toggle on the page, or press M when the clock is focused. When milliseconds are off, the display updates once per second for a steadier readout.",
    },
    {
      question: "How do I freeze the time?",
      answer:
        "Click Freeze (or press Space) to hold the current displayed value. Click Resume (or press Space again) to return to live updates.",
    },
    {
      question: "Does freezing change my system time?",
      answer:
        "No. Freeze only pauses the on-screen display. Your device clock continues normally.",
    },
    {
      question: "How do I use fullscreen mode?",
      answer:
        "Click Fullscreen or press F after clicking the clock card once. Browsers require a user gesture to enter fullscreen. Press Esc to exit.",
    },
    {
      question: "Why does fullscreen sometimes not open?",
      answer:
        "Most browsers block fullscreen unless it is triggered by a click, tap, or keypress. Click the page/card and try again. Some mobile browsers also limit fullscreen behavior.",
    },
    {
      question: "Why can the milliseconds look less smooth sometimes?",
      answer:
        "Browsers may throttle animations and timers in background tabs, low-power modes, or during screen sharing. Keep the tab visible for the smoothest millisecond updates.",
    },
    {
      question: "Does this change time zones?",
      answer:
        "No. This page shows your device's local time. If you need UTC or other zones, use a UTC clock, world clock, or a time zone converter tool.",
    },
    {
      question: "Can I use this on a second monitor or during a presentation?",
      answer:
        "Yes. Fullscreen mode is designed for a large, clean display, and the Freeze option can hold a specific time on screen when you need it.",
    },
    {
      question: "Does it keep running if I close the tab?",
      answer:
        "No. It runs in your browser while this page is open. If you close the tab or browser, it stops.",
    },
    {
      question: "Which related time tools should I use instead?",
      answer:
        "Use Digital Clock for a simpler seconds display, UTC Clock for UTC, Current Local Time for a local clock with copy and comparison controls, Epoch Unix Time Clock for timestamps, and Milliseconds Converter when you need to convert durations.",
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
              {f.answer}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
