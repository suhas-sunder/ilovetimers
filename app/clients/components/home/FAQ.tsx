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
  const defaults: FaqItem[] = [
    {
      question: "Are these timers accurate?",
      answer:
        "They are designed to avoid drift by tracking real elapsed time. For the most consistent display during events, keep the timer visible or use fullscreen.",
    },
    {
      question: "Do timers keep working if I switch tabs or lock my phone?",
      answer:
        "Browsers can throttle updates in the background, but the timers keep tracking time and catch up when the page resumes.",
    },
    {
      question: "How do I enter a custom countdown time?",
      answer:
        "Type seconds, mm:ss, or h:mm:ss in the countdown input, then press Set. You can also click a preset.",
    },
    {
      question: "How do I make the timer silent?",
      answer:
        "Turn off Sound in the timer controls or mute your device. Silent mode is useful for meetings, classrooms, and recording.",
    },
    {
      question: "Are there keyboard shortcuts?",
      answer:
        "Yes. Focus a timer card then use Space to start or pause, R to reset, F to fullscreen, L for lap on Stopwatch, and N to skip on Pomodoro or HIIT.",
    },
    {
      question: "Can I use it on a TV or projector?",
      answer:
        "Yes. Use Fullscreen for a large high-contrast display that is readable from a distance.",
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
            <div className="px-5 pb-4 text-slate-700 leading-relaxed">
              {f.answer}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
