"use client";

import cn from "clsx";
import type { QuizOption } from "@/types/quiz";
import { CheckIcon, CrossIcon } from "../icons/quiz";

/**
 * Correct/incorrect is signalled by WEIGHT and MODE, never by hue.
 *
 * Terminal Green measures about 1.75:1 on white — a hard WCAG failure — so it
 * cannot be promoted to a UI success colour, and a green/red pair would be
 * invisible to red-green colour-blind readers anyway.
 *
 * Crimson is already this system's "attention / active" colour. Charcoal at 2px
 * on white is its "resolved / confirmed" state: maximum contrast, maximum
 * authority. So the WRONG answer gets the attention treatment and the RIGHT
 * one gets the authority treatment — which is correct for a teaching quiz,
 * because the thing that needs your attention is the mistake.
 *
 * Every state carries four redundant cues: border weight, fill, glyph and a
 * text label. Nothing depends on colour alone.
 */
export function OptionRow({
  option,
  letter,
  name,
  checked,
  revealed,
  isCorrect,
  onSelect,
}: {
  option: QuizOption;
  /** A., B., C., D. — a stable handle for talking about an answer. */
  letter: string;
  name: string;
  checked: boolean;
  revealed: boolean;
  isCorrect: boolean;
  onSelect: () => void;
}) {
  const chosenAndRight = revealed && checked && isCorrect;
  const chosenAndWrong = revealed && checked && !isCorrect;
  const revealedAnswer = revealed && !checked && isCorrect;

  return (
    <label
      className={cn(
        "flex cursor-pointer items-center gap-4 px-5 py-4 rounded-card transition-colors duration-150",
        chosenAndRight && "border-2 border-charcoal bg-studio shadow-raised",
        chosenAndWrong && "border-2 border-crimson bg-tint shadow-raised",
        revealedAnswer && "border-2 border-charcoal bg-studio shadow-raised",
        !revealed && checked && "border-2 border-crimson bg-tint shadow-raised",
        !revealed &&
          !checked &&
          "border border-border bg-studio shadow-card hover:border-crimson",
        revealed && !checked && !isCorrect && "border border-border bg-studio",
      )}
    >
      <input
        type="radio"
        name={name}
        value={option.id}
        checked={checked}
        onChange={onSelect}
        disabled={revealed}
        className="peer sr-only"
      />

      <span
        aria-hidden
        className={cn(
          "flex h-5 w-5 shrink-0 items-center justify-center border",
          chosenAndRight || revealedAnswer
            ? "border-charcoal bg-charcoal text-studio"
            : chosenAndWrong
              ? "border-crimson text-crimson"
              : checked
                ? "border-crimson bg-crimson text-studio"
                : "border-border text-transparent",
        )}
        /* A radio mark is a MARK, not a container — outside the 4px rule. */
        style={{ borderRadius: 9999 }}
      >
        {chosenAndRight || revealedAnswer ? (
          <CheckIcon size={12} />
        ) : chosenAndWrong ? (
          <CrossIcon size={12} />
        ) : null}
      </span>

      <span className="w-6 shrink-0 type-label tnum text-muted">{letter}</span>
      <span className="type-body flex-1">{option.text}</span>

      {chosenAndRight ? (
        <span className="type-eyebrow shrink-0 text-charcoal">Correct</span>
      ) : chosenAndWrong ? (
        <span className="type-eyebrow shrink-0 text-crimson-ink">Not quite</span>
      ) : revealedAnswer ? (
        <span className="type-eyebrow shrink-0 text-charcoal">
          Correct answer
        </span>
      ) : null}
    </label>
  );
}
