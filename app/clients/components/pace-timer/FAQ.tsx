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
  // Pace Timer defaults (page-specific)
  const defaults: FaqItem[] = [
    {
      question: "What is the Pace Timer?",
      answer:
        "Pace Timer is a running and rowing countdown timer that helps you hold a steady target pace. Set a target pace or a finish time, choose a distance, then follow a big, easy-to-read countdown with optional interval beeps and fullscreen mode.",
    },
    {
      question: "How do I use it for running vs rowing?",
      answer: (
        <>
          Choose <strong className="text-slate-900">Running</strong> to work in{" "}
          <strong className="text-slate-900">min/km</strong> or{" "}
          <strong className="text-slate-900">min/mi</strong>. Choose{" "}
          <strong className="text-slate-900">Rowing</strong> to work in{" "}
          <strong className="text-slate-900">split per 500m</strong>. Then set a
          distance and either a target pace or finish time.
        </>
      ),
    },
    {
      question: "Should I enter a target pace or a finish time?",
      answer: (
        <div className="grid gap-2">
          <div>
            Use <strong className="text-slate-900">Target pace</strong> when you
            already know the pace/split you want to hold (example{" "}
            <strong className="text-slate-900">5:00</strong> /km,{" "}
            <strong className="text-slate-900">8:00</strong> /mi, or{" "}
            <strong className="text-slate-900">2:10</strong> /500m).
          </div>
          <div>
            Use <strong className="text-slate-900">Finish time</strong> when you
            have a goal time and want the tool to calculate the needed pace for
            the chosen distance.
          </div>
        </div>
      ),
    },
    {
      question: "What formats can I type for pace and finish time?",
      answer: (
        <div className="grid gap-2">
          <div>
            <strong className="text-slate-900">Target pace</strong>: type{" "}
            <strong className="text-slate-900">m:ss</strong> (example{" "}
            <strong className="text-slate-900">5:00</strong>) or seconds
            (example <strong className="text-slate-900">300</strong>).
          </div>
          <div>
            <strong className="text-slate-900">Finish time</strong>: type{" "}
            <strong className="text-slate-900">mm:ss</strong> (example{" "}
            <strong className="text-slate-900">25:00</strong>) or{" "}
            <strong className="text-slate-900">hh:mm:ss</strong> (example{" "}
            <strong className="text-slate-900">1:02:30</strong>).
          </div>
        </div>
      ),
    },
    {
      question: "What distance should I enter?",
      answer: (
        <>
          For <strong className="text-slate-900">Running</strong>, enter
          distance in <strong className="text-slate-900">km</strong> or{" "}
          <strong className="text-slate-900">mi</strong> (depending on the unit
          toggle). For <strong className="text-slate-900">Rowing</strong>, enter
          distance in <strong className="text-slate-900">meters</strong>.
        </>
      ),
    },
    {
      question: "What does “Finish” mean on the display?",
      answer:
        "Finish is the total target time for the whole distance. It’s calculated from your pace and distance (or shown directly when you’re using Finish time input).",
    },
    {
      question: "What does “At this pace, you should be at …” mean?",
      answer:
        "It’s a live pacing check. Based on the elapsed time and your target pace, it estimates the distance you should have covered so far (in km/mi for running, or meters for rowing).",
    },
    {
      question: "How do interval beeps work?",
      answer: (
        <div className="grid gap-2">
          <div>
            Turn on <strong className="text-slate-900">Sound</strong>, then set{" "}
            <strong className="text-slate-900">Beep every</strong>.
          </div>
          <div>
            Running: beeps every X{" "}
            <strong className="text-slate-900">km</strong> or{" "}
            <strong className="text-slate-900">mi</strong>.
          </div>
          <div>
            Rowing: beeps every X ×{" "}
            <strong className="text-slate-900">500m</strong> (example{" "}
            <strong className="text-slate-900">2</strong> = every 1000m).
          </div>
        </div>
      ),
    },
    {
      question: "Why don’t I hear beeps?",
      answer:
        "Make sure Sound is enabled, your device volume is up, and the tab isn’t muted. Some browsers require a user interaction before audio can play, so press Start once and try Test beep again.",
    },
    {
      question: "How do I start, pause, or reset?",
      answer:
        "Use Start/Pause to control the countdown. Reset returns the timer to the current target (based on your selected mode, distance, and pace/finish inputs).",
    },
    {
      question: "How do I use fullscreen mode?",
      answer: (
        <>
          Click <strong className="text-slate-900">Fullscreen</strong> (or press{" "}
          <strong className="text-slate-900">F</strong> after clicking the card
          once). Press <strong className="text-slate-900">Esc</strong> to exit
          fullscreen.
        </>
      ),
    },
    {
      question: "Why aren’t keyboard shortcuts working?",
      answer:
        "Click the card once to focus it, then try again. Shortcuts are ignored while you’re typing in an input field.",
    },
    {
      question: "What are the keyboard shortcuts?",
      answer: (
        <div className="grid gap-2">
          <div>
            <strong className="text-slate-900">Space</strong>: start/pause ·{" "}
            <strong className="text-slate-900">R</strong>: reset ·{" "}
            <strong className="text-slate-900">F</strong>: fullscreen
          </div>
          <div className="text-sm text-slate-600">
            Tip: click the timer card once so it captures keyboard input.
          </div>
        </div>
      ),
    },
    {
      question: "Does the timer keep running if I switch tabs?",
      answer:
        "Yes in most cases. The timer uses a real end time so it stays accurate across normal tab switches. Power-saving modes can affect animation smoothness, but remaining time is still calculated from the end time.",
    },
    {
      question: "Which related timer should I use instead?",
      answer: (
        <>
          Need structured intervals (work/rest/rounds)?{" "}
          <Link
            to="/hiit-timer"
            className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
          >
            HIIT Timer
          </Link>
          ,{" "}
          <Link
            to="/tabata-timer"
            className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
          >
            Tabata Timer
          </Link>
          , or{" "}
          <Link
            to="/round-timer"
            className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
          >
            Round Timer
          </Link>
          . Want a simple workout countdown?{" "}
          <Link
            to="/workout-timer"
            className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
          >
            Workout Timer
          </Link>
          . Need a pure big-screen view?{" "}
          <Link
            to="/fullscreen-timer"
            className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
          >
            Fullscreen Timer
          </Link>
          . Want multiple timers at once?{" "}
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
    {
      question: "Does this tool send my pace or workout data anywhere?",
      answer:
        "No. The timer runs locally in your browser. This page does not send your pace, distance, or timer state anywhere.",
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
