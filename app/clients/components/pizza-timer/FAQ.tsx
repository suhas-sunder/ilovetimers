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
  // Pizza Timer defaults (page-specific)
  const defaults: FaqItem[] = [
    {
      question: "What is the Pizza Timer?",
      answer:
        "Pizza Timer is a simple countdown timer with quick presets for frozen pizza and common reheating times. It includes a big, easy-to-read display, fullscreen mode, and optional reminders so you can check your pizza before it finishes.",
    },
    {
      question: "How do I start quickly with a preset?",
      answer:
        "Tap a preset (for example Frozen (Oven 14m) or Frozen (Air fryer 10m)), then press Start. Presets also set a sensible default “check” reminder time for that method.",
    },
    {
      question: "Can I set a custom time?",
      answer: (
        <>
          Yes. Enter your own{" "}
          <strong className="text-[var(--ilt-text-primary)]">Minutes</strong> and{" "}
          <strong className="text-[var(--ilt-text-primary)]">Seconds</strong>. When you edit the
          time, the Method switches to{" "}
          <strong className="text-[var(--ilt-text-primary)]">Custom</strong> automatically.
        </>
      ),
    },
    {
      question: "What does “Check with X min left” do?",
      answer:
        "It plays a reminder once when the timer reaches that remaining time (for example, at 2 minutes left). It’s meant to prompt a quick check so you can decide whether to pull the pizza or leave it a bit longer.",
    },
    {
      question: "What reminder styles are available?",
      answer: (
        <div className="grid gap-2">
          <div>
            <strong className="text-[var(--ilt-text-primary)]">Repeating (10s)</strong>: plays a
            short beep repeatedly for about 10 seconds.
          </div>
          <div>
            <strong className="text-[var(--ilt-text-primary)]">Triple beep</strong>: plays three
            quick beeps.
          </div>
          <div>
            <strong className="text-[var(--ilt-text-primary)]">None</strong>: disables the check
            reminder.
          </div>
        </div>
      ),
    },
    {
      question: "What are “Final beeps”?",
      answer:
        "If enabled (and Sound is on), the timer plays short beeps in the last 5 seconds (5…1) to help you catch the finish without watching the screen constantly.",
    },
    {
      question: "Why don’t I hear sound?",
      answer:
        "Make sure Sound is enabled, your device volume is up, and the tab isn’t muted. Some browsers require a user interaction before audio can play, so press Start once with Sound on, then try Test reminder again.",
    },
    {
      question: "How do I stop a repeating reminder sound?",
      answer: (
        <>
          Click <strong className="text-[var(--ilt-text-primary)]">Stop sound</strong>. This
          ends any repeating reminder early.
        </>
      ),
    },
    {
      question: "How do I use fullscreen mode?",
      answer: (
        <>
          Click <strong className="text-[var(--ilt-text-primary)]">Fullscreen</strong> (or press{" "}
          <strong className="text-[var(--ilt-text-primary)]">F</strong> after clicking the timer
          card once). Press <strong className="text-[var(--ilt-text-primary)]">Esc</strong> to
          exit fullscreen. In fullscreen, you can{" "}
          <strong className="text-[var(--ilt-text-primary)]">tap/click the time</strong> to
          start or pause.
        </>
      ),
    },
    {
      question: "How do I start, pause, or reset?",
      answer:
        "Use Start/Pause to control the countdown. Reset returns the timer to the currently selected time (preset or custom).",
    },
    {
      question: "What are the keyboard shortcuts?",
      answer: (
        <div className="grid gap-2">
          <div>
            <strong className="text-[var(--ilt-text-primary)]">Space</strong>: start/pause ·{" "}
            <strong className="text-[var(--ilt-text-primary)]">R</strong>: reset ·{" "}
            <strong className="text-[var(--ilt-text-primary)]">F</strong>: fullscreen
          </div>
          <div className="text-sm text-[var(--ilt-text-muted)]">
            Tip: click the timer card once so it captures keyboard input.
          </div>
        </div>
      ),
    },
    {
      question: "Why aren’t keyboard shortcuts working?",
      answer:
        "Click the card once to focus it, then try again. Shortcuts are ignored while you’re typing in an input field.",
    },
    {
      question: "What can change pizza timing?",
      answer:
        "Oven temperature, preheating, crust thickness, topping load, rack position, pizza stone or pan material, and whether the pizza is frozen, homemade, or reheated can all change the right check time.",
    },
    {
      question: "Does the timer keep running if I switch tabs?",
      answer:
        "The timer tracks a target end time while the page is open. Power-saving modes can affect animation smoothness or background updates, but remaining time is recalculated from the end time when the page is active again.",
    },
    {
      question: "Does this tool send any data anywhere?",
      answer:
        "No. The timer runs locally in your browser. This page does not send your timer settings or timer state anywhere.",
    },
    {
      question: "Which related timer should I use instead?",
      answer: (
        <>
          Want a general kitchen timer for anything?{" "}
          <Link
            to="/cooking-timer"
            className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
          >
            Cooking Timer
          </Link>
          . Need a simple countdown with no presets?{" "}
          <Link
            to="/countdown-timer"
            className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
          >
            Countdown Timer
          </Link>
          . Prefer no audio?{" "}
          <Link
            to="/silent-timer"
            className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
          >
            Silent Timer
          </Link>
          . Need a pure big-screen view?{" "}
          <Link
            to="/fullscreen-timer"
            className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
          >
            Fullscreen Timer
          </Link>
          . Timing multiple dishes at once?{" "}
          <Link
            to="/multiple-timers"
            className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
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

      <h2 className="text-2xl font-semibold text-[var(--ilt-text-primary)]">{title}</h2>

      <div className="mt-4 divide-y divide-[var(--ilt-border-subtle)] ilt-surface-card">
        {faqs.map((f) => (
          <details key={f.question}>
            <summary className="cursor-pointer px-5 py-4 font-medium text-[var(--ilt-text-primary)] hover:bg-[var(--ilt-bg-hover)]">
              {f.question}
            </summary>
            <div className="px-5 pb-4 leading-relaxed text-[var(--ilt-text-secondary)]">
              {f.answer}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
