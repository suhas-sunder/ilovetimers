import { Link } from "react-router";
import { JsonLd } from "./HowItWorks";

/* =========================================================
   FAQ (SEO + UX)
   Schema: FAQPage (tool page)
========================================================= */
export type FaqItem = {
  question: string;
  answer: string | React.ReactNode;
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
  // Meeting Count Up Timer defaults (page-specific)
  const defaults: FaqItem[] = [
    {
      question: "What does this Meeting Count Up Timer do?",
      answer:
        "It tracks elapsed meeting time with a simple count-up display. Press Start when the meeting begins, Pause for breaks, and Reset to clear everything. You can go fullscreen for a large, readable display and record Topic splits to track how long each agenda item takes.",
    },
    {
      question: "How do Topic splits work?",
      answer:
        "Press Topic (or T) while the timer is running to record an agenda split. Each split shows the total elapsed meeting time at the moment you pressed Topic, plus the split time since the previous Topic. Splits are shown most recent first.",
    },
    {
      question: "Can I rename the Topic button?",
      answer:
        "Yes. Use Button label in the Agenda helper to change the Topic label to match your meeting flow (for example: Agenda, Section, Demo, Q&A, or Wrap-up). Your recorded items will use that label.",
    },
    {
      question: "What does “# of agenda topics” do?",
      answer:
        "It optionally caps how many Topic splits you can record. Leave it blank (∞) for unlimited splits, or set a number to match your agenda. If you already recorded topics, the cap will not drop below the number of existing splits.",
    },
    {
      question: "How does fullscreen work on this timer?",
      answer:
        "Fullscreen gives you a big, room-friendly time display with a small top bar for Start/Pause, Topic, and Reset. In fullscreen, you can tap or click the time display to start or pause. Exit fullscreen with Esc or the Exit button.",
    },
    {
      question: "What keyboard shortcuts are supported?",
      answer:
        "Space starts or pauses, T records a Topic split, R resets, F toggles fullscreen, and Esc exits fullscreen. Shortcuts are ignored while you are typing in an input.",
    },
    {
      question: "Does Reset clear Topic splits too?",
      answer:
        "Yes. Reset stops the timer, sets elapsed time back to 0, and clears all Topic splits. Your Topic label and agenda cap settings remain as you set them.",
    },
    {
      question: "Why can’t I press Topic sometimes?",
      answer:
        "Topic is only available while the timer is running. If you set an agenda cap, Topic is also disabled once you reach that number of splits.",
    },
    {
      question: "Which related timer should I use instead?",
      answer: (
        <>
          Need a countdown for time remaining instead of elapsed time?{" "}
          <Link
            to="/meeting-timer"
            className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
          >
            Meeting Timer
          </Link>
          . Want a simpler count up without Topic splits?{" "}
          <Link
            to="/count-up-timer"
            className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
          >
            Count Up Timer
          </Link>
          . Presenting and want a stage-friendly view?{" "}
          <Link
            to="/presentation-timer"
            className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
          >
            Presentation Timer
          </Link>
          . Prefer classic lap-style timing?{" "}
          <Link
            to="/stopwatch"
            className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
          >
            Stopwatch
          </Link>
          . Need to add up multiple durations after the meeting?{" "}
          <Link
            to="/time-calculator"
            className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
          >
            Time Calculator
          </Link>
          .
        </>
      ),
    },
  ];

  const faqs = items?.length ? items : defaults;

  // JSON-LD must be string-only; strip React nodes if any custom items are passed.
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs
      .filter((f) => typeof f.answer === "string")
      .map((f) => ({
        "@type": "Question",
        name: f.question,
        acceptedAnswer: { "@type": "Answer", text: f.answer as string },
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
              {f.answer}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
