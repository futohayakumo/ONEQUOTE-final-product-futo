"use client";

import { useCallback, useEffect, useState } from "react";
import { QUIZ } from "@/lib/quiz-data";
import { ArrowRight } from "../icons/ArrowRight";
import { ProgressBar } from "../ui/ProgressBar";
import { QuestionCard } from "./QuestionCard";
import { QuizResult } from "./QuizResult";

const STORAGE_KEY = "oneportfolio.quiz.v1";

interface Saved {
  index: number;
  answers: (string | null)[];
  revealed: boolean[];
}

const blank = (): Saved => ({
  index: 0,
  answers: QUIZ.map(() => null),
  revealed: QUIZ.map(() => false),
});

export function QuizRunner() {
  const [state, setState] = useState<Saved>(blank);
  const [finished, setFinished] = useState(false);

  // Read in an effect, never during render — reading storage while rendering
  // is the classic hydration-mismatch bug.
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Saved;
      if (
        Array.isArray(parsed.answers) &&
        parsed.answers.length === QUIZ.length
      ) {
        // Reading sessionStorage during render would cause a hydration
        // mismatch, so saved progress is restored once after mount.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setState(parsed);
      }
    } catch {
      /* a corrupt or blocked store just means starting fresh */
    }
  }, []);

  const persist = useCallback((next: Saved) => {
    setState(next);
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* private mode — the quiz still works, it just will not resume */
    }
  }, []);

  if (finished) {
    return (
      <QuizResult
        answers={state.answers}
        onRetake={() => {
          persist(blank());
          setFinished(false);
        }}
      />
    );
  }

  const i = state.index;
  const question = QUIZ[i];
  const revealed = state.revealed[i];
  const isLast = i === QUIZ.length - 1;

  return (
    <div className="flex max-w-[54rem] flex-col gap-8">
      <div className="flex items-center gap-5">
        <span className="shrink-0 type-caption tnum">
          Question {i + 1} of {QUIZ.length}
        </span>
        <div className="min-w-0 flex-1">
          <ProgressBar
            value={i + (revealed ? 1 : 0)}
            max={QUIZ.length}
            label={`Question ${i + 1} of ${QUIZ.length}`}
          />
        </div>
      </div>

      <QuestionCard
        question={question}
        selected={state.answers[i]}
        revealed={revealed}
        onSelect={(optionId) => {
          if (revealed) return;
          const answers = [...state.answers];
          const rev = [...state.revealed];
          answers[i] = optionId;
          rev[i] = true;
          persist({ ...state, answers, revealed: rev });
        }}
      />

      <div>
        <button
          type="button"
          disabled={!revealed}
          onClick={() => {
            if (isLast) setFinished(true);
            else persist({ ...state, index: i + 1 });
          }}
          className="inline-flex items-center gap-3 border border-crimson bg-crimson px-6 py-3 type-label text-studio rounded-sharp transition-colors duration-150 hover:border-charcoal hover:bg-charcoal disabled:cursor-not-allowed disabled:border-border disabled:bg-border disabled:text-muted"
        >
          {isLast ? "See results" : "Next"}
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
