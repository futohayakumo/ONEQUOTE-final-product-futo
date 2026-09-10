"use client";

import Link from "next/link";

import { QUIZ } from "@/lib/quiz-data";
import { CheckIcon, CrossIcon } from "../icons/quiz";
import { SectionTitle } from "../ui/SectionTitle";
import { useT } from "../shell/LocaleProvider";

export function QuizResult({
  answers,
  onRetake,
}: {
  answers: (string | null)[];
  onRetake: () => void;
}) {
  const t = useT();
  const score = QUIZ.reduce(
    (n, q, i) => n + (answers[i] === q.correctId ? 1 : 0),
    0,
  );

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <SectionTitle>
          {t("quiz.score", { score, total: QUIZ.length })}
        </SectionTitle>
        <p className="type-caption">
          {score === QUIZ.length
            ? t("quiz.full")
            : t("quiz.review")}
        </p>
      </div>

      <ul className="flex flex-col gap-3">
        {QUIZ.map((q, i) => {
          const right = answers[i] === q.correctId;
          const correct = q.options.find((o) => o.id === q.correctId);
          return (
            <li
              key={q.id}
              className="flex gap-4 border border-border bg-studio p-5 rounded-card shadow-card"
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
                <p className="type-label">{t(q.promptKey)}</p>
                <p className="type-caption">
                  <span className="sr-only">
                    {right ? t("quiz.correct") : t("quiz.notQuite")}. 
                  </span>
                  {t("quiz.answer", { text: correct ? t(correct.textKey) : "" })}
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
          className="border border-border bg-studio px-6 py-3 type-label rounded-card shadow-card transition-colors duration-150 hover:border-crimson hover:text-crimson"
        >
          {t("quiz.retake")}
        </button>
        <Link
          href="/process"
          className="border border-border bg-studio px-6 py-3 type-label rounded-card shadow-card transition-colors duration-150 hover:border-crimson hover:text-crimson"
        >
          {t("quiz.backToProcess")}
        </Link>
      </div>
    </div>
  );
}
