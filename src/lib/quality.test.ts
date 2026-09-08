import assert from "node:assert/strict";
import test from "node:test";
import {
  BASELINE_DEFECTS_PER_KLOC,
  BREAK_EVEN_CATCH,
  DEFECT_FACTOR,
  DEFECT_GAP,
  INTERNAL,
  PUBLISHED_DEFECT,
  PUBLISHED_SPEED,
  RECOVERY_IS_ENOUGH,
  SPEED_GAP,
  DEFECT_EVIDENCE,
  RECOVERY,
  RECOVERY_EVIDENCE,
  SPEED_EVIDENCE,
  quality,
} from "./quality.ts";

const ALL = [...SPEED_EVIDENCE, ...DEFECT_EVIDENCE, ...RECOVERY_EVIDENCE];

test("every constant carries a source, a sample and a link", () => {
  for (const e of ALL) {
    assert.ok(e.source.length > 0, `${e.id} has no source`);
    assert.ok(e.sample.length > 0, `${e.id} has no sample size`);
    assert.match(e.url, /^https:\/\//, `${e.id} has no link`);
    assert.ok(e.reported.length > 0, `${e.id} does not say how it was reported`);
  }
});

test("no two pieces of evidence share an id", () => {
  assert.equal(new Set(ALL.map((e) => e.id)).size, ALL.length);
});

test("the published factors are the median of the published rows", () => {
  // The median, not the mean: a single outlier must not move the headline, and
  // a reader can check a median by counting rows.
  const median = (xs: number[]) => {
    const f = [...xs].sort((a, b) => a - b);
    const m = Math.floor(f.length / 2);
    return f.length % 2 ? f[m] : (f[m - 1] + f[m]) / 2;
  };
  // SPEED_FACTOR and DEFECT_FACTOR are the INTERNAL figures — the headline.
  // These two are what the published table adds up to, shown beside it.
  assert.equal(PUBLISHED_SPEED, median(SPEED_EVIDENCE.map((e) => e.factor)));
  assert.equal(PUBLISHED_DEFECT, median(DEFECT_EVIDENCE.map((e) => e.factor)));
  assert.equal(RECOVERY, median(RECOVERY_EVIDENCE.map((e) => e.factor)));
});

test("no PUBLISHED source is quoted as saying three times faster", () => {
  // The internal report says 3x and is labelled as internal. No study in the
  // table may be made to say it — if one genuinely reports 3x it belongs here
  // as a row, where it moves the published median honestly.
  for (const e of SPEED_EVIDENCE) {
    assert.equal(e.origin, "published");
    assert.ok(e.factor < 2.5, `${e.id} claims ${e.factor.toFixed(2)}x`);
  }
  assert.ok(PUBLISHED_SPEED < 2 && PUBLISHED_DEFECT < 2);
});

test("every published row is marked as published", () => {
  for (const e of ALL) assert.equal(e.origin, "published");
});

test("AI assistance alone is faster AND worse", () => {
  const base = quality("traditional");
  const assisted = quality("ai-assisted");
  assert.ok(assisted.speed > base.speed, "it does buy lead time");
  assert.ok(
    assisted.escapedPerKloc > base.escapedPerKloc,
    "and it does sell defect rate — that is the whole finding",
  );
});

test("automated review changes what escapes, not what is written", () => {
  const assisted = quality("ai-assisted");
  const withQa = quality("ai-with-qa");
  assert.equal(
    withQa.defectsPerKloc,
    assisted.defectsPerKloc,
    "the code is no better; the pipeline is",
  );
  assert.ok(withQa.escapedPerKloc < assisted.escapedPerKloc);
  assert.equal(withQa.speed, assisted.speed, "review does not cost lead time");
});

test("the headline is the internal figure, and it is labelled as one", () => {
  assert.equal(quality("ai-assisted").speed, INTERNAL.speed);
  assert.match(INTERNAL.label, /internal/i);
  assert.ok(INTERNAL.methodology.length > 40, "a sceptic asks how it was counted");
});

test("the internal figure sits above every published one, and says so", () => {
  // Not a defect in the data — the gap is the most interesting thing here, and
  // a test that let it drift silently would be hiding it.
  assert.ok(SPEED_GAP > 1, `internal speed is ${SPEED_GAP.toFixed(1)}x published`);
  assert.ok(DEFECT_GAP > 1, `internal defects are ${DEFECT_GAP.toFixed(1)}x published`);
  for (const e of DEFECT_EVIDENCE) assert.ok(e.factor < INTERNAL.defects);
  for (const e of SPEED_EVIDENCE) assert.ok(e.factor < INTERNAL.speed);
});

test("automated review is NOT sufficient at the internal defect rate", () => {
  // The finding that falls out of the internal number, and the reason the page
  // does not end at "add AI review".
  const base = quality("traditional");
  const withQa = quality("ai-with-qa");
  assert.ok(
    withQa.escapedPerKloc > base.escapedPerKloc,
    "at 5x injection, a 73% gate still leaks more than writing it by hand",
  );
  assert.equal(RECOVERY_IS_ENOUGH, false);
});

test("break-even is derived, not asserted", () => {
  assert.equal(BREAK_EVEN_CATCH, 1 - 1 / INTERNAL.defects);
  // A gate exactly at break-even leaves the baseline rate untouched.
  const escaped =
    BASELINE_DEFECTS_PER_KLOC * INTERNAL.defects * (1 - BREAK_EVEN_CATCH);
  assert.ok(Math.abs(escaped - BASELINE_DEFECTS_PER_KLOC) < 1e-9);
});

test("recovery is a share, and the arithmetic follows from it", () => {
  assert.ok(RECOVERY > 0 && RECOVERY < 1);
  const q = quality("ai-with-qa");
  assert.equal(
    Math.round(q.escapedPerKloc * 1e6) / 1e6,
    Math.round(BASELINE_DEFECTS_PER_KLOC * DEFECT_FACTOR * (1 - RECOVERY) * 1e6) / 1e6,
  );
});
