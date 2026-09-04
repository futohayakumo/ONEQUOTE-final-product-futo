import assert from "node:assert/strict";
import { test } from "node:test";
import {
  STORY_POINTS,
  buildSchedule,
  compare,
  wallSeconds,
} from "./processModel.ts";

const near = (a: number, b: number, tol: number) =>
  assert.ok(Math.abs(a - b) <= tol, `${a} not within ${tol} of ${b}`);

test("traditional totals match the published table", () => {
  const expected: Record<string, number> = {
    "0.5": 3.8,
    "1": 5.4,
    "2": 9.0,
    "3": 12.9,
    "5": 21.5,
    "8": 35.5,
  };
  for (const sp of STORY_POINTS) {
    near(
      buildSchedule("traditional", sp).totalDays,
      expected[String(sp)],
      0.06,
    );
  }
});

test("ai-driven totals match the published table", () => {
  const expected: Record<string, number> = {
    "0.5": 0.78,
    "1": 0.89,
    "2": 1.12,
    "3": 1.35,
    "5": 1.81,
    "8": 2.5,
  };
  for (const sp of STORY_POINTS) {
    near(buildSchedule("ai-driven", sp).totalDays, expected[String(sp)], 0.02);
  }
});

test("the advantage GROWS with batch size — this is the whole argument", () => {
  const small = compare(0.5).ratio;
  const large = compare(8).ratio;
  near(small, 4.9, 0.15);
  near(large, 14.2, 0.3);
  assert.ok(large > small * 2.5, "ratio must widen sharply with story points");
});

test("wall clock spreads in traditional and stays flat in ai-driven", () => {
  const tSmall = buildSchedule("traditional", 0.5).wallMs;
  const tLarge = buildSchedule("traditional", 8).wallMs;
  const aSmall = buildSchedule("ai-driven", 0.5).wallMs;
  const aLarge = buildSchedule("ai-driven", 8).wallMs;

  assert.ok(
    tLarge / tSmall >= 2.8,
    `traditional spread ${tLarge / tSmall} < 2.8`,
  );
  assert.ok(
    aLarge / aSmall <= 1.2,
    `ai-driven spread ${aLarge / aSmall} > 1.2`,
  );

  // Every ai-driven run must last long enough for five station beats to be
  // separately visible, and short enough to stay watchable.
  for (const sp of STORY_POINTS) {
    const ms = buildSchedule("ai-driven", sp).wallMs;
    assert.ok(
      ms >= 3600 && ms <= 4200,
      `ai-driven ${sp}SP wall ${ms}ms out of range`,
    );
  }

  // The traditional room must still take visibly longer at every size.
  for (const sp of STORY_POINTS) {
    const t = buildSchedule("traditional", sp).wallMs;
    const a = buildSchedule("ai-driven", sp).wallMs;
    if (sp >= 2) {
      assert.ok(
        t > a,
        `traditional ${sp}SP (${t}ms) should outlast ai (${a}ms)`,
      );
    }
  }
});

test("traditional carries queue wait; ai-driven carries none", () => {
  assert.ok(buildSchedule("traditional", 5).waitDays > 12);
  assert.equal(buildSchedule("ai-driven", 5).waitDays, 0);
  assert.equal(buildSchedule("ai-driven", 5).flowEfficiency, 1);
});

test("entering later in the pipeline shortens the run", () => {
  const full = buildSchedule("traditional", 3, "intake").totalDays;
  const late = buildSchedule("traditional", 3, "dev").totalDays;
  assert.ok(late < full);
  assert.deepEqual(
    buildSchedule("traditional", 3, "dev").perStep.map((s) => s.stepId),
    ["dev", "test", "deploy"],
  );
});

test("wallSeconds is monotonic", () => {
  assert.ok(wallSeconds(1) < wallSeconds(5));
  assert.ok(wallSeconds(5) < wallSeconds(35));
});
