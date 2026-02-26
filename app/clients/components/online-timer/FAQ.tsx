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
  // Online Timer defaults (page-specific)
  const defaults: FaqItem[] = [
    {
      question: "What is the Online Timer?",
      answer:
        "Online Timer is a simple countdown timer you can start instantly. It includes quick presets, custom time entry, sound, loop mode, fullscreen display, and keyboard shortcuts.",
    },
    {
      question: "How do I set the timer duration?",
      answer: (
        <>
          Use a preset (like <strong className="text-slate-900">5m</strong> or{" "}
          <strong className="text-slate-900">10m</strong>), or type a time and
          press <strong className="text-slate-900">Set</strong>. Time entry
          supports <strong className="text-slate-900">ss</strong>,{" "}
          <strong className="text-slate-900">mm:ss</strong>, and{" "}
          <strong className="text-slate-900">h:mm:ss</strong>.
        </>
      ),
    },
    {
      question: "What formats can I type into the time box?",
      answer: (
        <div className="grid gap-2">
          <div>
            <strong className="text-slate-900">ss</strong> (example{" "}
            <strong className="text-slate-900">45</strong>) = 45 seconds
          </div>
          <div>
            <strong className="text-slate-900">mm:ss</strong> (example{" "}
            <strong className="text-slate-900">05:00</strong>) = 5 minutes
          </div>
          <div>
            <strong className="text-slate-900">h:mm:ss</strong> (example{" "}
            <strong className="text-slate-900">1:02:30</strong>) = 1 hour, 2
            minutes, 30 seconds
          </div>
          <div className="text-sm text-slate-600">
            Note: values over 24 hours are clamped to 24 hours.
          </div>
        </div>
      ),
    },
    {
      question: "How do I start, pause, restart, or reset the timer?",
      answer:
        "Use Start/Pause to control the countdown. Reset returns the timer to the currently set duration. If the timer is Done, Start becomes Restart.",
    },
    {
      question: "What happens when the timer reaches zero?",
      answer:
        "When it hits 0, the timer stops and shows Done. If Sound is enabled, it plays a short beep. If Loop is enabled, it immediately restarts the same duration.",
    },
    {
      question: "What do Sound and Loop do?",
      answer:
        "Sound controls whether the timer can beep at the end. Loop repeats the countdown automatically each time it reaches zero.",
    },
    {
      question: "Why don’t I hear any sound?",
      answer:
        "Make sure Sound is enabled, your device volume is up, and the tab isn’t muted. Some browsers also require a user interaction before audio can play, so click Start once and try again.",
    },
    {
      question: "How do I use fullscreen mode?",
      answer: (
        <>
          Click <strong className="text-slate-900">Fullscreen</strong> (or press{" "}
          <strong className="text-slate-900">F</strong> after clicking the timer
          card once). Press <strong className="text-slate-900">Esc</strong> to
          exit. In fullscreen you can also{" "}
          <strong className="text-slate-900">tap/click the timer</strong> to
          start or pause.
        </>
      ),
    },
    {
      question: "Why aren’t keyboard shortcuts working?",
      answer:
        "Click the timer card once to focus it, then try again. Shortcuts are ignored while you’re typing in an input field. In fullscreen, Esc exits fullscreen.",
    },
    {
      question: "What are the keyboard shortcuts?",
      answer: (
        <div className="grid gap-2">
          <div>
            <strong className="text-slate-900">Space</strong>: start/pause ·{" "}
            <strong className="text-slate-900">R</strong>: reset ·{" "}
            <strong className="text-slate-900">F</strong>: fullscreen ·{" "}
            <strong className="text-slate-900">Esc</strong>: exit fullscreen
          </div>
          <div className="text-sm text-slate-600">
            Tip: click the timer card once so it captures keyboard input.
          </div>
        </div>
      ),
    },
    {
      question: "Does this timer keep running if I switch tabs?",
      answer:
        "Yes in most cases. The timer uses a real end time so it stays accurate across normal tab switches. Very aggressive power-saving modes can affect animation smoothness, but the remaining time is still calculated from the end time.",
    },
    {
      question: "Which related timer should I use instead?",
      answer: (
        <>
          Want a dedicated big-screen layout?{" "}
          <Link
            to="/fullscreen-timer"
            className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
          >
            Fullscreen Timer
          </Link>
          . Timing a talk or lesson?{" "}
          <Link
            to="/presentation-timer"
            className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
          >
            Presentation Timer
          </Link>{" "}
          or{" "}
          <Link
            to="/classroom-timer"
            className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
          >
            Classroom Timer
          </Link>
          . Need multiple countdowns?{" "}
          <Link
            to="/multiple-timers"
            className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
          >
            Multiple Timers
          </Link>
          . Prefer no sound?{" "}
          <Link
            to="/silent-timer"
            className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
          >
            Silent Timer
          </Link>
          .
        </>
      ),
    },
    {
      question: "Does this tool send my timer data anywhere?",
      answer:
        "No. The timer runs locally in your browser. This page does not send your timer entries or countdown state anywhere.",
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
