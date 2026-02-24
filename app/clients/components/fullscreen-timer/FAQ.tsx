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
  // Fullscreen Timer defaults (page-specific)
  const defaults: FaqItem[] = [
    {
      question: "What does this Fullscreen Timer do?",
      answer:
        "It runs a simple countdown with huge digits designed for projectors, smartboards, classrooms, and second displays. Choose a preset or set a custom time, start/pause, optionally enable sound, turn on loop mode to repeat, and use fullscreen with click/tap control.",
    },
    {
      question: "How do I set the timer length?",
      answer:
        "Choose a preset (1m to 60m) or type a custom time in the input. You can enter seconds (ss), minutes:seconds (mm:ss), or hours:minutes:seconds (hh:mm:ss). Press Set or click out of the input to apply it.",
    },
    {
      question: "How do Start, Pause, and Reset work?",
      answer:
        "Start begins counting down from the current remaining time. Pause stops the countdown and keeps your remaining time. Reset stops the timer and returns the remaining time to the selected duration.",
    },
    {
      question: "Can I control the timer by clicking the display?",
      answer:
        "Yes. In fullscreen mode, click or tap the big time display to start or pause. This is meant for projector setups where you want minimal controls on screen.",
    },
    {
      question: "What keyboard shortcuts are supported?",
      answer:
        "Space start/pause · R reset · F fullscreen · Esc exits fullscreen. If shortcuts don’t work, click/tap the timer card once so it has focus.",
    },
    {
      question: "How does fullscreen mode work?",
      answer:
        "Click Fullscreen (or press F). Press Esc or the Exit button to leave fullscreen. In fullscreen, the page shows a minimal top bar and you can click/tap the timer display to start or pause.",
    },
    {
      question: "What do Sound and Loop do?",
      answer:
        "Sound plays a short beep when the countdown completes. Loop automatically restarts the same duration when it reaches zero (useful for stations, rotations, and repeated rounds).",
    },
    {
      question: "I don’t hear any sound. What should I do?",
      answer:
        "Some browsers block audio until you interact with the page. Click Start once (or press Space) and make sure your tab and device are not muted. If you still don’t hear beeps, try toggling Sound off and on.",
    },
    {
      question: "Will the timer stay accurate if the tab stutters?",
      answer:
        "It’s anchored to an absolute end time and recalculates remaining time from your device clock, which helps keep the countdown steady across typical browser scheduling delays.",
    },
    {
      question: "Is there a maximum timer length?",
      answer: "This timer supports durations up to 24 hours.",
    },
    {
      question: "Which related tool should I use instead?",
      answer: (
        <>
          For classroom-specific workflows, use{" "}
          <Link
            to="/classroom-timer"
            className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
          >
            Classroom Timer
          </Link>
          . For presentation pacing, use{" "}
          <Link
            to="/presentation-timer"
            className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
          >
            Presentation Timer
          </Link>
          . For a general-purpose countdown (not focused on fullscreen), use{" "}
          <Link
            to="/countdown-timer"
            className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
          >
            Countdown Timer
          </Link>
          . For a no-audio page, use{" "}
          <Link
            to="/silent-timer"
            className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
          >
            Silent Timer
          </Link>
          . For several timers at once, use{" "}
          <Link
            to="/multiple-timers"
            className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
          >
            Multiple Timers
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
