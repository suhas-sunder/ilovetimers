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
  // Breathing Timer defaults
  const defaults: FaqItem[] = [
    {
      question: "What does this Breathing Timer do?",
      answer:
        "It guides you through timed inhale, hold, and exhale phases with a large countdown. You can use presets (Box breathing, 4-7-8, Calm) or set a custom cycle, optionally enable sound cues, and use fullscreen for a clean display.",
    },
    {
      question: "How do I start, pause, and reset?",
      answer:
        "Press Space to start/pause. Use the on-screen Start/Pause button if you prefer. Press R (or click Reset) to return to the ready state and restart from the beginning of the cycle.",
    },
    {
      question: "What are the presets and what do they change?",
      answer:
        "Presets set the inhale, hold, and exhale seconds (and sometimes a target number of cycles). Box breathing is 4-4-4-4 and runs continuously. 4-7-8 is 4-7-8 with no second hold and runs 4 cycles. Calm is 4-2-6 and runs continuously. You can also choose Custom and set your own timings.",
    },
    {
      question: "Can I skip the holds?",
      answer:
        "Yes. Set either hold value to 0 seconds and the timer will skip that phase and only run the remaining phases in your pattern.",
    },
    {
      question: "What does Cycles mean?",
      answer:
        "Cycles controls how many full breathing cycles to run. A cycle is counted when the pattern wraps back to Inhale. Set Cycles to 0 to run continuously until you pause. Set it to a positive number to stop automatically after that many cycles.",
    },
    {
      question: "What does Sound do?",
      answer:
        "When Sound is on, the timer plays gentle tones at phase changes to help you follow along without staring at the screen. When Sound is off, the timer is silent.",
    },
    {
      question: "Why don’t I hear sound even when it’s enabled?",
      answer:
        "Some browsers block audio until you interact with the page. Click Start or press Space once, then toggle Sound on. Also check your device volume and mute settings.",
    },
    {
      question: "How does fullscreen work?",
      answer:
        "Fullscreen makes the breathing display large and uncluttered. Press F to toggle fullscreen and Esc to exit. In fullscreen, you can also tap/click the timer display to start or pause.",
    },
    {
      question: "What keyboard shortcuts are supported?",
      answer:
        "Space start/pause, R reset, F fullscreen, and S toggle sound. If keys don’t respond, click the card once so it has keyboard focus.",
    },
    {
      question: "Does this page save my settings or require an account?",
      answer:
        "No account is required. The timer runs in your browser. This page does not need to save anything for core functionality.",
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
