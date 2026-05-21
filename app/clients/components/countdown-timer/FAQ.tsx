const faqs = [
  {
    question: "What does this Countdown Timer do?",
    answer:
      "It counts down from the minutes and seconds you set. You can start, pause, reset, add one minute, subtract ten seconds, and use fullscreen.",
  },
  {
    question: "Can I change the time while it is running?",
    answer:
      "Yes. Use +1:00 or -0:10 for quick changes. You can also pause, edit the minutes or seconds, and apply the new duration.",
  },
  {
    question: "Does fullscreen change the timer?",
    answer:
      "No. Fullscreen only changes the display size. The countdown state and controls stay the same.",
  },
  {
    question: "Will it still alert me if I close the tab?",
    answer:
      "No. This is a browser timer, so the page needs to stay open. Use your device alarm for anything critical.",
  },
  {
    question: "When should I use a specialized timer instead?",
    answer:
      "Use Countdown Timer for a simple one-off duration. Use Online Timer for the fastest generic setup, Fullscreen Timer for a projected display, Silent Timer for no-sound rooms, Multiple Timers for concurrent tasks, Break Timer for short pauses, or Cooking Timer for kitchen timing.",
  },
];

export default function FAQ({ title = "Frequently asked questions" }: { title?: string }) {
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <section className="mx-auto max-w-7xl px-4 pb-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />
      <div className="ilt-surface-card p-5">
        <h2 className="text-xl font-semibold text-[var(--ilt-text-primary)]">
          {title}
        </h2>
        <div className="mt-4 grid gap-3">
          {faqs.map((item) => (
            <details key={item.question} className="ilt-surface-muted p-4">
              <summary className="cursor-pointer text-sm font-semibold text-[var(--ilt-text-primary)] ilt-focus-ring">
                {item.question}
              </summary>
              <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
