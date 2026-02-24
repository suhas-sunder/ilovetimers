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
  // Chaos Timer defaults
  const defaults: FaqItem[] = [
    {
      question: "What does this Chaos Timer do?",
      answer:
        "It generates unpredictable countdowns by rolling a random duration inside your selected seconds range. You can run a single random countdown or run a sequence of random intervals, with fullscreen and optional sound beeps.",
    },
    {
      question:
        "What’s the difference between Random timer and Random interval timer?",
      answer:
        "Random timer runs one random countdown and then stops. Random interval timer runs multiple random countdowns back-to-back for the number of intervals you choose.",
    },
    {
      question: "How do I start, pause, and reset?",
      answer:
        "Press Space to start or pause, or use the on-screen Start/Pause button. Press R (or click Reset) to re-roll from your current settings and return to the ready state.",
    },
    {
      question: "How do Min seconds and Max seconds work?",
      answer:
        "Each countdown duration is randomly selected as a whole number of seconds between Min and Max (inclusive). If Min is greater than Max, the timer automatically swaps them.",
    },
    {
      question: "What does “Intervals” mean in interval mode?",
      answer:
        "Intervals is how many random countdowns to run in sequence. The progress indicator shows how many intervals you’ve completed out of the total.",
    },
    {
      question: "What is “Next preview”?",
      answer:
        "In interval mode, the timer rolls the next random duration early and shows it as a preview. This gives you a small heads-up for what’s coming next without making the whole session predictable.",
    },
    {
      question: "What does Sound do?",
      answer:
        "When Sound is on, the timer can play beeps (end-of-interval beeps and optional final beeps). When Sound is off, the timer is silent.",
    },
    {
      question: "What are “Beep each interval” and “Final beeps”?",
      answer:
        "Beep each interval plays a beep when an interval ends (interval mode). Final beeps plays short beeps during the last 5 seconds of a running countdown as a heads-up that it’s about to end.",
    },
    {
      question: "Why don’t I hear sound even when it’s enabled?",
      answer:
        "Some browsers block audio until you interact with the page. Click Start or press Space once, then try toggling Sound on. Also check your device volume and mute settings.",
    },
    {
      question: "How does fullscreen work?",
      answer:
        "Fullscreen makes the display large and uncluttered. Press F to toggle fullscreen and Esc to exit. In fullscreen you can also tap/click the timer display to start or pause.",
    },
    {
      question: "What keyboard shortcuts are supported?",
      answer:
        "Space start/pause, R reset, F fullscreen, and S toggle sound. If keys don’t respond, click the timer card once so it has keyboard focus.",
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
