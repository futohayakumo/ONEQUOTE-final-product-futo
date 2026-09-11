"use client";

import type { QuizQuestion } from "@/types/quiz";
import { OptionRow } from "../../molecules/OptionRow";
import { WhyItMatters } from "../../molecules/WhyItMatters";
import { useT } from "../../providers/LocaleProvider";

export function QuestionCard({
  question,
  selected,
  revealed,
  onSelect,
}: {
  question: QuizQuestion;
  selected: string | null;
  revealed: boolean;
  onSelect: (optionId: string) => void;
}) {
  const t = useT();
  return (
    <div className="flex flex-col gap-6">
      {/* A real fieldset/legend, so the group and the "N of 4" position are
          announced. A div with onClick loses all of that. */}
      <fieldset className="flex flex-col gap-3 border-0 p-0">
        <legend className="mb-5 type-section">{t(question.promptKey)}</legend>
        {question.options.map((option, i) => (
          <OptionRow
            key={option.id}
            option={option}
            letter={`${String.fromCharCode(65 + i)}.`}
            name={question.id}
            checked={selected === option.id}
            revealed={revealed}
            isCorrect={option.id === question.correctId}
            onSelect={() => onSelect(option.id)}
          />
        ))}
      </fieldset>

      {revealed ? <WhyItMatters>{t(question.whyKey)}</WhyItMatters> : null}
    </div>
  );
}
