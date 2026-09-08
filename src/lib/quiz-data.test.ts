import assert from "node:assert/strict";
import { test } from "node:test";
import en from "../locales/en.json" with { type: "json" };
import { QUIZ } from "./quiz-data.ts";

const copy = en as Record<string, string>;

/**
 * Guards against the quiz becoming answerable without reading it. An earlier
 * version had every correct answer at option B, so a full score needed no
 * knowledge at all — which is worse than having no quiz.
 */

test("no single option slot holds a majority of the answers", () => {
  const counts = new Map<string, number>();
  for (const q of QUIZ) {
    counts.set(q.correctId, (counts.get(q.correctId) ?? 0) + 1);
  }
  const worst = Math.max(...counts.values());
  assert.ok(
    worst <= 2,
    `answer slot "${[...counts].find(([, n]) => n === worst)?.[0]}" holds ${worst} of ${QUIZ.length} answers`,
  );
  assert.ok(counts.size >= 3, `answers use only ${counts.size} of 4 slots`);
});

test("every question is well formed", () => {
  assert.equal(QUIZ.length, 5);
  for (const q of QUIZ) {
    assert.equal(q.options.length, 4, `${q.id} must offer four options`);
    assert.ok(
      q.options.some((o) => o.id === q.correctId),
      `${q.id} names a correct option that does not exist`,
    );
    const ids = new Set(q.options.map((o) => o.id));
    assert.equal(ids.size, 4, `${q.id} has duplicate option ids`);
    const texts = new Set(q.options.map((o) => copy[o.textKey]));
    assert.equal(texts.size, 4, `${q.id} has duplicate option text`);
    assert.ok(
      copy[q.promptKey].trim().endsWith("?"),
      `${q.id} prompt must be a question`,
    );
    assert.ok(
      copy[q.whyKey].length > 80,
      `${q.id} explanation must say why, not just what`,
    );
  }
});

test("explanations do not simply restate the correct option", () => {
  for (const q of QUIZ) {
    const correct = q.options.find((o) => o.id === q.correctId)!;
    assert.notEqual(
      copy[q.whyKey].trim(),
      copy[correct.textKey].trim(),
      `${q.id} explanation is just the answer again`,
    );
  }
});
