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
      question: "Does the alarm work if I close the tab or lock my phone?",
      answer:
        "No. This alarm runs in your browser while this page is open. If you close the tab/app or your browser session ends, it cannot ring like a system alarm.",
    },
    {
      question: "Will it still be accurate if I switch tabs?",
      answer:
        "Yes. Browsers can throttle visual updates in background tabs, but the timer tracks elapsed time and catches up when you return. For the smoothest display, keep it visible or use fullscreen.",
    },
    {
      question: "Why didn’t I hear the sound?",
      answer:
        "Some browsers block audio until you click/tap the page first. Also check device volume, mute switch, and Bluetooth output (sound may route to earbuds/speakers).",
    },
    {
      question: "How do I set a custom time?",
      answer:
        "Use the Minutes box to type a value from 1 to 180, or click a preset (1m, 2m, 5m, 10m, etc.). Changing minutes resets the countdown.",
    },
    {
      question: "How do I stop the alarm once it’s ringing?",
      answer:
        "Click Stop alarm. You can also press X when the timer card is focused. Reset returns the timer to the selected minutes.",
    },
    {
      question: "Are there keyboard shortcuts?",
      answer:
        "Yes. Click the timer card once, then use Space to start/pause, R to reset, F for fullscreen, S to toggle sound, and X to stop a ringing alarm.",
    },
    {
      question: "Can I use it on a TV or projector?",
      answer:
        "Yes. Fullscreen gives a large, high-contrast display that’s readable from a distance.",
    },
    {
      question: "Does fullscreen work everywhere?",
      answer:
        "Fullscreen requires user interaction and can be limited by browser/device policies (especially on mobile). If it fails, try a different browser or start fullscreen from a button click.",
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
