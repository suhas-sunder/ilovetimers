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
  // Count Up Timer defaults
  const defaults: FaqItem[] = [
    {
      question: "What does this Count Up Timer do?",
      answer:
        "It tracks elapsed time from 0 upward. You can start/pause, record laps (splits), reset anytime, and go fullscreen for a large, readable display.",
    },
    {
      question: "How do I start, pause, and reset?",
      answer:
        "Click Start to begin and Pause to stop temporarily. Click Reset to return to 0 and clear laps. Keyboard: Space starts/pauses and R resets.",
    },
    {
      question: "What are laps and splits?",
      answer:
        "A lap is a checkpoint you record while the timer is running. Each lap shows Total elapsed time and Split time since the previous lap (Lap 1 split is since start). Laps are listed most recent first.",
    },
    {
      question: "When can I record a lap?",
      answer:
        "Only while the timer is running. If the timer is paused, Lap is disabled to prevent accidental checkpoints.",
    },
    {
      question: "How does fullscreen work?",
      answer:
        "Fullscreen makes the digits large and removes distractions. Press F (or click Fullscreen) to enter or exit, and Esc to exit. In fullscreen, you can also tap/click the time to start or pause.",
    },
    {
      question: "What keyboard shortcuts are supported?",
      answer:
        "Space start/pause, L lap, R reset, F fullscreen, Esc exit fullscreen. If keys do not respond, click the timer card once so it has keyboard focus.",
    },
    {
      question: "Why does the display change in whole seconds?",
      answer:
        "The on-screen time is shown in whole seconds (rounded up) for a steady, readable readout. Internally the timer still tracks milliseconds for smooth updates.",
    },
    {
      question:
        "Does the timer keep accurate time if I switch tabs or lock my phone?",
      answer:
        "Usually yes, but behavior varies by browser and device. Some browsers reduce animation/update frequency in the background. When you return, the elapsed time should jump to the correct value even if the animation looked less smooth while inactive.",
    },
    {
      question: "Does this page save my time or laps, or require an account?",
      answer:
        "No account is required. The timer runs locally in your browser. Refreshing the page resets the timer and clears laps.",
    },
    {
      question: "What should I use if I need something different?",
      answer:
        "Use Countdown Timer or Fullscreen Timer if you need to count down to zero. Use Meeting Count Up Timer if you want a meeting-focused elapsed timer layout. Use Multiple Timers if you need several timers running at once.",
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
