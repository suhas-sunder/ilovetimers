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
          Use a preset (like <strong className="text-[var(--ilt-text-primary)]">5m</strong> or{" "}
          <strong className="text-[var(--ilt-text-primary)]">10m</strong>), or type a time and
          press <strong className="text-[var(--ilt-text-primary)]">Set</strong>. Time entry
          supports <strong className="text-[var(--ilt-text-primary)]">ss</strong>,{" "}
          <strong className="text-[var(--ilt-text-primary)]">mm:ss</strong>, and{" "}
          <strong className="text-[var(--ilt-text-primary)]">h:mm:ss</strong>.
        </>
      ),
    },
    {
      question: "What formats can I type into the time box?",
      answer: (
        <div className="grid gap-2">
          <div>
            <strong className="text-[var(--ilt-text-primary)]">ss</strong> (example{" "}
            <strong className="text-[var(--ilt-text-primary)]">45</strong>) = 45 seconds
          </div>
          <div>
            <strong className="text-[var(--ilt-text-primary)]">mm:ss</strong> (example{" "}
            <strong className="text-[var(--ilt-text-primary)]">05:00</strong>) = 5 minutes
          </div>
          <div>
            <strong className="text-[var(--ilt-text-primary)]">h:mm:ss</strong> (example{" "}
            <strong className="text-[var(--ilt-text-primary)]">1:02:30</strong>) = 1 hour, 2
            minutes, 30 seconds
          </div>
          <div className="text-sm text-[var(--ilt-text-muted)]">
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
          Click <strong className="text-[var(--ilt-text-primary)]">Fullscreen</strong> (or press{" "}
          <strong className="text-[var(--ilt-text-primary)]">F</strong> after clicking the timer
          card once). Press <strong className="text-[var(--ilt-text-primary)]">Esc</strong> to
          exit. In fullscreen you can also{" "}
          <strong className="text-[var(--ilt-text-primary)]">tap/click the timer</strong> to
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
            <strong className="text-[var(--ilt-text-primary)]">Space</strong>: start/pause ·{" "}
            <strong className="text-[var(--ilt-text-primary)]">R</strong>: reset ·{" "}
            <strong className="text-[var(--ilt-text-primary)]">F</strong>: fullscreen ·{" "}
            <strong className="text-[var(--ilt-text-primary)]">Esc</strong>: exit fullscreen
          </div>
          <div className="text-sm text-[var(--ilt-text-muted)]">
            Tip: click the timer card once so it captures keyboard input.
          </div>
        </div>
      ),
    },
    {
      question: "Does this timer keep running if I switch tabs?",
      answer:
        "In normal tab switches, it reconciles remaining time from a real end time instead of only counting interval ticks. Very aggressive power-saving modes, sleeping devices, or paused browser activity can affect what you see until the page resumes.",
    },
    {
      question: "Which related timer should I use instead?",
      answer: (
        <>
          Want a dedicated big-screen layout?{" "}
          <Link
            to="/fullscreen-timer"
            className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
          >
            Fullscreen Timer
          </Link>
          . Timing a talk or lesson?{" "}
          <Link
            to="/presentation-timer"
            className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
          >
            Presentation Timer
          </Link>{" "}
          or{" "}
          <Link
            to="/classroom-timer"
            className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
          >
            Classroom Timer
          </Link>
          . Need multiple countdowns?{" "}
          <Link
            to="/multiple-timers"
            className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
          >
            Multiple Timers
          </Link>
          . Want the standard one-off countdown page?{" "}
          <Link
            to="/countdown-timer"
            className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
          >
            Countdown Timer
          </Link>
          . Prefer no sound?{" "}
          <Link
            to="/silent-timer"
            className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
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
