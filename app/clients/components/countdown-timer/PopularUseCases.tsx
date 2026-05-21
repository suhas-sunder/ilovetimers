const uses = [
  {
    title: "Cooking steps",
    text: "Run a visible countdown for pasta, oven checks, resting time, or short prep stages.",
  },
  {
    title: "Meetings and presentations",
    text: "Keep a shared timer on screen for agenda blocks, Q&A buffers, and speaker timing.",
  },
  {
    title: "Classrooms and study blocks",
    text: "Use a simple countdown for exercises, reading time, quizzes, or focus sessions.",
  },
  {
    title: "Breaks and transitions",
    text: "Set a short timer for stretch breaks, room resets, or returning from a pause.",
  },
];

export default function PopularUseCases() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-10">
      <div className="ilt-surface-card p-5">
        <h2 className="text-xl font-semibold text-[var(--ilt-text-primary)]">
          Common uses
        </h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {uses.map((item) => (
            <div key={item.title} className="ilt-surface-muted p-4">
              <h3 className="text-base font-semibold text-[var(--ilt-text-primary)]">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
