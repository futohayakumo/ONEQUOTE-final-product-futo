import { TransitionLink } from "../ui/TransitionLink";
import { QUIZ } from "@/lib/quiz-data";
import { CheckIcon, CrossIcon } from "../icons/quiz";
import { SectionTitle } from "../ui/SectionTitle";

export function QuizResult({
  answers,
  onRetake,
}: {
  answers: (string | null)[];
  onRetake: () => void;
}) {
  const score = QUIZ.reduce(
    (n, q, i) => n + (answers[i] === q.correctId ? 1 : 0),
    0,
  );

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <SectionTitle>
          {score} of {QUIZ.length} correct
        </SectionTitle>
        <p className="type-caption">
          {score === QUIZ.length
            ? "Full marks. Every rule above is enforced by tooling rather than by memory, which is the point."
            : "Review the ones you missed below. Each explanation says why the rule exists, not just what it is."}
        </p>
      </div>

      <ul className="flex flex-col gap-3">
        {QUIZ.map((q, i) => {
          const right = answers[i] === q.correctId;
          const correct = q.options.find((o) => o.id === q.correctId);
          return (
            <li
              key={q.id}
              className="flex gap-4 border border-border bg-studio p-4 rounded-sharp"
            >
              <span
                aria-hidden
                className={
                  right
                    ? "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center border border-charcoal bg-charcoal text-studio"
                    : "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center border border-crimson text-crimson"
                }
                style={{ borderRadius: 9999 }}
              >
                {right ? <CheckIcon size={12} /> : <CrossIcon size={12} />}
              </span>
              <div className="flex flex-col gap-1">
                <p className="type-label">{q.prompt}</p>
                <p className="type-caption">
                  <span className="sr-only">
                    {right ? "Correct. " : "Incorrect. "}
                  </span>
                  Answer: {correct?.text}
                </p>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onRetake}
          className="border border-border bg-studio px-6 py-3 type-label rounded-sharp transition-colors duration-150 hover:border-crimson hover:text-crimson"
        >
          Retake
        </button>
        <TransitionLink
          href="/journeys/process"
          direction="back"
          className="border border-border bg-studio px-6 py-3 type-label rounded-sharp transition-colors duration-150 hover:border-crimson hover:text-crimson"
        >
          Back to Process Comparison
        </TransitionLink>
      </div>
    </div>
  );
}
