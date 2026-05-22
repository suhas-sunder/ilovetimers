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
  // Moon Phase Clock defaults (page-specific)
  const defaults: FaqItem[] = [
    {
      question: "What does this Moon Phase Clock show?",
      answer:
        "It shows the current moon phase (label), an illumination estimate, moon age in days, and a big live countdown to the next major phase (New Moon, First Quarter, Full Moon, or Last Quarter).",
    },
    {
      question: "What is the countdown counting down to?",
      answer:
        "The countdown is to the next major phase boundary. The “Next” line shows which major phase is coming up and the estimated local time it occurs.",
    },
    {
      question: "How do I switch between Live and Manual?",
      answer:
        "Live updates continuously. If you edit the date, hour, or minute, the page switches to Manual automatically. To return to Live, click Now (and optionally keep Live toggled on).",
    },
    {
      question: "How do I check the moon phase for a specific date and time?",
      answer:
        "Turn Live off or just edit the Date, Hour, and Minute fields. The display updates immediately and shows the phase label, illumination, age, and the next major phase relative to that moment.",
    },
    {
      question: "What does illumination mean here?",
      answer:
        "Illumination is an estimate of how much of the moon’s face is lit, shown as a percentage. It updates as the lunar cycle progresses.",
    },
    {
      question: "What does moon age mean?",
      answer:
        "Moon age is the estimated number of days since the last New Moon. It’s shown to one decimal place for quick comparison.",
    },
    {
      question: "What are “major phases”?",
      answer:
        "Major phases are the four main points in the cycle: New Moon, First Quarter, Full Moon, and Last Quarter. This page counts down to the next one.",
    },
    {
      question: "How do I go fullscreen?",
      answer:
        "Click Fullscreen or press F after clicking the clock once so shortcuts are active. Press Esc to exit fullscreen.",
    },
    {
      question: "What do Sound and Final beeps do?",
      answer:
        "Sound toggles audio on or off. Final beeps adds short beeps close to the next major phase when you want a heads-up. Final beeps only runs in Live mode.",
    },
    {
      question: "Why didn’t I hear any sound?",
      answer:
        "Many browsers require a user action before audio can play. Turn Sound on, then click Now once to unlock audio. Also confirm your device volume is not muted.",
    },
    {
      question: "Why aren’t keyboard shortcuts working?",
      answer:
        "Click the clock card once to focus it, then try again. Shortcuts are ignored when you’re typing in an input field. In fullscreen, Esc also exits fullscreen.",
    },
    {
      question: "What are the keyboard shortcuts?",
      answer: (
        <div className="grid gap-2">
          <div>
            <strong className="text-[var(--ilt-text-primary)]">F</strong>: fullscreen ·{" "}
            <strong className="text-[var(--ilt-text-primary)]">Esc</strong>: exit fullscreen
          </div>
          <div className="text-sm text-[var(--ilt-text-muted)]">
            Tip: click the clock once so it captures keyboard input.
          </div>
        </div>
      ),
    },
    {
      question: "Which related tool should I use instead?",
      answer: (
        <>
          Want sunrise and sunset times too?{" "}
          <Link
            to="/sunrise-sunset-clock"
            className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
          >
            Sunrise Sunset Clock
          </Link>
          . Want a broader sky-style display?{" "}
          <Link
            to="/astronomical-clock"
            className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
          >
            Astronomical Clock
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
      question: "How accurate is this?",
      answer:
        "It’s a fast lunar-cycle estimate designed for a smooth clock experience. It is useful for everyday planning and quick checks, but it is not intended to replace specialized ephemeris data.",
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
