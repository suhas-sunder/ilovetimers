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
  // Morse Code Clock defaults (page-specific)
  const defaults: FaqItem[] = [
    {
      question: "What does this Morse Code Clock show?",
      answer:
        "It shows your current local time and renders each digit as Morse code (dots and dashes). You can view the output as blocks (shapes) or as text.",
    },
    {
      question: "Does it update automatically?",
      answer:
        "Yes. The clock updates continuously and stays aligned to the second boundary so the display feels stable.",
    },
    {
      question: "Can I hide seconds?",
      answer:
        "Yes. Turn Seconds off to show only HH:MM. When seconds are off, the Morse output also reflects only hours and minutes.",
    },
    {
      question: "Can I switch between 24-hour and 12-hour time?",
      answer:
        "Yes. Toggle 24-hour to switch formats. In 12-hour mode, the hours are shown from 01 to 12.",
    },
    {
      question: "What is the difference between Block view and Text view?",
      answer:
        "Block view renders dots and dashes as simple shapes for readability. Text view shows the raw Morse strings for each digit, which is useful for copying or comparing.",
    },
    {
      question: "How do I go fullscreen?",
      answer:
        "Click Fullscreen (or press F after clicking the clock once so shortcuts are active). Press Esc to exit fullscreen.",
    },
    {
      question: "How do I copy the current output?",
      answer:
        "Click Copy (or press C). It copies both the normal time (HH:MM or HH:MM:SS) and the Morse representation in a clean, shareable format.",
    },
    {
      question: "Why aren’t keyboard shortcuts working?",
      answer:
        "Click the clock card once to focus it, then try again. Shortcuts are ignored when you’re typing in a form field. In fullscreen, Esc also exits fullscreen.",
    },
    {
      question: "What are the keyboard shortcuts?",
      answer: (
        <div className="grid gap-2">
          <div>
            <strong className="text-[var(--ilt-text-primary)]">F</strong>: fullscreen ·{" "}
            <strong className="text-[var(--ilt-text-primary)]">T</strong>: 24-hour ·{" "}
            <strong className="text-[var(--ilt-text-primary)]">S</strong>: seconds ·{" "}
            <strong className="text-[var(--ilt-text-primary)]">V</strong>: view ·{" "}
            <strong className="text-[var(--ilt-text-primary)]">C</strong>: copy ·{" "}
            <strong className="text-[var(--ilt-text-primary)]">Esc</strong>: exit fullscreen
          </div>
          <div className="text-sm text-[var(--ilt-text-muted)]">
            Tip: click the clock once so it captures keyboard input.
          </div>
        </div>
      ),
    },
    {
      question: "Which time zone does it use?",
      answer:
        "It uses your device’s local time zone. If your system clock or time zone is incorrect, the display will match that.",
    },
    {
      question: "What Morse code is used for digits?",
      answer:
        "It uses standard Morse digits: 1 is .---- through 5 is ..... then 6 is -.... through 0 is -----.",
    },
    {
      question: "Which related tool should I use instead?",
      answer: (
        <>
          Want a standard display?{" "}
          <Link
            to="/digital-clock"
            className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
          >
            Digital Clock
          </Link>
          . Want another “coded” style?{" "}
          <Link
            to="/binary-clock"
            className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
          >
            Binary Clock
          </Link>
          . Need time in other locations?{" "}
          <Link
            to="/world-clock"
            className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
          >
            World Clock
          </Link>
          . Converting across zones?{" "}
          <Link
            to="/time-zone-converter"
            className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
          >
            Time Zone Converter
          </Link>
          .
        </>
      ),
    },
    {
      question: "Does this clock send or store my time data?",
      answer:
        "No. The time is read from your device and rendered in your browser. The Copy feature writes to your clipboard only when you press it.",
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

      <div className="mt-4 divide-y divide-[var(--ilt-border-subtle)]">
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
