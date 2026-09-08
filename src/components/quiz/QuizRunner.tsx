"use client";

import { useCallback, useEffect, useState } from "react";
import { QUIZ } from "@/lib/quiz-data";
import { ArrowRight } from "../icons/ArrowRight";
import { ProgressBar } from "../ui/ProgressBar";
import { QuestionCard } from "./QuestionCard";
import { QuizResult } from "./QuizResult";
import { useT } from "../shell/LocaleProvider";

const STORAGE_KEY = "portfolio.knowledge-check.v1";

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
  const t = useT();
  const [state, setState] = useState<Saved>(blank);
  const [finished, setFinished] = useState(false);

  // Read in an effect, never during render — reading storage while rendering
  // is the classic hydration-mismatch bug.
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Saved;
      // All three fields, not one. `revealed` and `index` were trusted, so a
      // session written by an earlier shape gave `state.revealed[i]` of
      // undefined or an index past the end -- a TypeError during render, which
      // the try/catch around the parse does not cover.
      if (
        Array.isArray(parsed.answers) &&
        parsed.answers.length === QUIZ.length &&
        Array.isArray(parsed.revealed) &&
        parsed.revealed.length === QUIZ.length &&
        Number.isInteger(parsed.index) &&
        parsed.index >= 0 &&
        parsed.index < QUIZ.length
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
  const chosen = state.answers[i] !== null;
  const isLast = i === QUIZ.length - 1;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-5">
        <span className="shrink-0 type-caption tnum">
          {t("quiz.progress", { n: i + 1, total: QUIZ.length })}
        </span>
        <div className="min-w-0 flex-1">
          {/* i + 1, not i: on arrival the bar was empty, which reads as "no
              progress bar" rather than "question one of five". The question
              you are on is progress. */}
          <ProgressBar
            value={i + 1}
            max={QUIZ.length}
            label={t("quiz.progress", { n: i + 1, total: QUIZ.length })}
          />
        </div>
        {/* Progress is restored from the session, so landing mid-quiz needs an
            obvious way back to the start. */}
      </div>

      <QuestionCard
        question={question}
        selected={state.answers[i]}
        revealed={revealed}
        onSelect={(optionId) => {
          if (revealed) return;
          const answers = [...state.answers];
          answers[i] = optionId;
          persist({ ...state, answers });
        }}
      />

      {/* Announced, not merely revealed. Focus does not move on answering, so
          without this a screen-reader user gets no account of what happened. */}
      <p aria-live="polite" className="sr-only">
        {revealed
          ? state.answers[i] === question.correctId
            ? t("quiz.announceCorrect")
            : t("quiz.announceWrong", {
                text: t(
                  question.options.find((o) => o.id === question.correctId)
                    ?.textKey ?? "",
                ),
              })
          : ""}
      </p>

      <div className="flex flex-wrap items-center gap-6">
        <button
          type="button"
          aria-disabled={!chosen}
          onClick={(e) => {
            // aria-disabled, not disabled: a native disabled button leaves the
            // tab order, so a keyboard user tabbing forward never met the
            // control and got no account of why the quiz had no next step.
            if (!chosen) {
              e.preventDefault();
              return;
            }
            if (!revealed) {
              const rev = [...state.revealed];
              rev[i] = true;
              persist({ ...state, revealed: rev });
            } else if (isLast) setFinished(true);
            else persist({ ...state, index: i + 1 });
          }}
          className={`inline-flex items-center gap-3 border px-7 py-3.5 type-label rounded-card transition-colors duration-150 ${
            chosen
              ? "border-crimson bg-crimson text-studio hover:border-charcoal hover:bg-charcoal"
              : "cursor-not-allowed border-control bg-mist text-charcoal"
          }`}
        >
          {!chosen
            ? t("quiz.choose")
            : !revealed
              ? t("quiz.check")
              : isLast
                ? t("quiz.results")
                : t("quiz.next")}
          <ArrowRight size={18} />
        </button>

        {i > 0 || revealed ? (
          <button
            type="button"
            onClick={() => persist(blank())}
            className="type-caption text-muted underline underline-offset-4 transition-colors duration-150 hover:text-crimson-ink"
          >
            {t("quiz.startOver")}
          </button>
        ) : null}
      </div>
    </div>
  );
}
