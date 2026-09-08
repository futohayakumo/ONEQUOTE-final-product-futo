import assert from "node:assert/strict";
import test from "node:test";
import {
  BASELINE_DEFECTS_PER_KLOC,
  DEFECT_EVIDENCE,
  DEFECT_FACTOR,
  QUALITY_MODES,
  RECOVERY,
  RECOVERY_EVIDENCE,
  SPEED_EVIDENCE,
  SPEED_FACTOR,
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

test("the headline factors are the median of the published ones", () => {
  // The median, not the mean: a single outlier must not move the headline, and
  // a reader can check a median by counting rows.
  const median = (xs: number[]) => {
    const f = [...xs].sort((a, b) => a - b);
    const m = Math.floor(f.length / 2);
    return f.length % 2 ? f[m] : (f[m - 1] + f[m]) / 2;
  };
  assert.equal(SPEED_FACTOR, median(SPEED_EVIDENCE.map((e) => e.factor)));
  assert.equal(DEFECT_FACTOR, median(DEFECT_EVIDENCE.map((e) => e.factor)));
  assert.equal(RECOVERY, median(RECOVERY_EVIDENCE.map((e) => e.factor)));
});

test("no source is quoted as saying AI is three times faster", () => {
  // The claim this model was built to replace. Every measurement found runs
  // between no change and about 1.8x; if a future source genuinely reports 3x
  // it belongs in the table, not in a headline the table cannot support.
  for (const e of SPEED_EVIDENCE) {
    assert.ok(e.factor < 2.5, `${e.id} claims ${e.factor.toFixed(2)}x`);
  }
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

test("only the QA path beats the baseline on both axes", () => {
  const base = quality("traditional");
  const better = QUALITY_MODES.filter((m) => {
    const o = quality(m);
    return o.speed >= base.speed && o.escapedPerKloc <= base.escapedPerKloc;
  });
  assert.deepEqual(better, ["traditional", "ai-with-qa"]);
});

test("recovery is a share, and the arithmetic follows from it", () => {
  assert.ok(RECOVERY > 0 && RECOVERY < 1);
  const q = quality("ai-with-qa");
  assert.equal(
    Math.round(q.escapedPerKloc * 1e6) / 1e6,
    Math.round(BASELINE_DEFECTS_PER_KLOC * DEFECT_FACTOR * (1 - RECOVERY) * 1e6) / 1e6,
  );
});
