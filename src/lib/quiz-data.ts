import type { QuizQuestion } from "@/types/quiz";

/*
 * Answer positions are deliberately spread across the four slots.
 *
 * An earlier version had the correct answer at option B in all five questions,
 * which meant the quiz could be passed 5/5 by clicking the second row without
 * reading a word. Everything else about the screen — real radios, redundant
 * non-colour cues, an explanation that gives the reason rather than the answer
 * — made that giveaway worse rather than better, because it turned a genuine
 * exercise into a prop. quiz-data.test.ts now fails if the spread degenerates.
 */

export const QUIZ: readonly QuizQuestion[] = [
  {
    id: "q1",
    promptKey: "quiz.q1.prompt",
    options: [
      { id: "a", textKey: "quiz.q1.a" },
      { id: "b", textKey: "quiz.q1.b" },
      { id: "c", textKey: "quiz.q1.c" },
      { id: "d", textKey: "quiz.q1.d" },
    ],
    correctId: "d",
    whyKey: "quiz.q1.why",
  },
  {
    id: "q2",
    promptKey: "quiz.q2.prompt",
    options: [
      { id: "a", textKey: "quiz.q2.a" },
      { id: "b", textKey: "quiz.q2.b" },
      { id: "c", textKey: "quiz.q2.c" },
      { id: "d", textKey: "quiz.q2.d" },
    ],
    correctId: "c",
    whyKey: "quiz.q2.why",
  },
  {
    id: "q3",
    promptKey: "quiz.q3.prompt",
    options: [
      { id: "a", textKey: "quiz.q3.a" },
      { id: "b", textKey: "quiz.q3.b" },
      { id: "c", textKey: "quiz.q3.c" },
      { id: "d", textKey: "quiz.q3.d" },
    ],
    correctId: "a",
    whyKey: "quiz.q3.why",
  },
  {
    id: "q4",
    promptKey: "quiz.q4.prompt",
    options: [
      { id: "a", textKey: "quiz.q4.a" },
      { id: "b", textKey: "quiz.q4.b" },
      { id: "c", textKey: "quiz.q4.c" },
      { id: "d", textKey: "quiz.q4.d" },
    ],
    correctId: "b",
    whyKey: "quiz.q4.why",
  },
  {
    id: "q5",
    promptKey: "quiz.q5.prompt",
    options: [
      { id: "a", textKey: "quiz.q5.a" },
      { id: "b", textKey: "quiz.q5.b" },
      { id: "c", textKey: "quiz.q5.c" },
      { id: "d", textKey: "quiz.q5.d" },
    ],
    correctId: "c",
    whyKey: "quiz.q5.why",
  },
] as const;
