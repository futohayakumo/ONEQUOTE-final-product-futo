import assert from "node:assert/strict";
import { test } from "node:test";
import {
  ARRIVAL_FRACTION,
  STORY_POINTS,
  buildSchedule,
  compare,
  phaseFor,
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

test("entering later in the pipeline shortens the run, in BOTH rooms", () => {
  const full = buildSchedule("traditional", 3, "intake").totalDays;
  const late = buildSchedule("traditional", 3, "dev").totalDays;
  assert.ok(late < full);

  // The AI room used to return an identical total wherever you entered, which
  // made the advantage ratio move for a reason unrelated to the argument.
  const aiFull = buildSchedule("ai-driven", 3, "intake").totalDays;
  const aiLate = buildSchedule("ai-driven", 3, "dev").totalDays;
  assert.ok(aiLate < aiFull, `ai ${aiLate} should be under ${aiFull}`);
  assert.deepEqual(
    buildSchedule("traditional", 3, "dev").perStep.map((s) => s.stepId),
    ["dev", "test", "deploy"],
  );
});

test("wallSeconds is monotonic", () => {
  assert.ok(wallSeconds(1) < wallSeconds(5));
  assert.ok(wallSeconds(5) < wallSeconds(35));
});

test("a work segment reports transit before arrival and working after", () => {
  for (const mode of ["traditional", "ai-driven"] as const) {
    const arrive = ARRIVAL_FRACTION[mode];
    assert.equal(phaseFor("work", 0, mode), "transit");
    assert.equal(phaseFor("work", arrive - 0.01, mode), "transit");
    assert.equal(phaseFor("work", arrive, mode), "working");
    assert.equal(phaseFor("work", 1, mode), "working");
    assert.equal(phaseFor("wait", 0, mode), "waiting");
    assert.equal(phaseFor("wait", 1, mode), "waiting");
  }
});

test("phase is never absent mid-run", () => {
  // Folding transit in with "no phase" made the panel announce "Finished"
  // while the item was still moving — for 58% of every AI-driven segment.
  for (const mode of ["traditional", "ai-driven"] as const) {
    for (let p = 0; p <= 1.0001; p += 0.02) {
      for (const kind of ["work", "wait"] as const) {
        const phase = phaseFor(kind, p, mode);
        assert.ok(
          phase === "waiting" || phase === "transit" || phase === "working",
          `${mode} ${kind} at ${p.toFixed(2)} produced ${phase}`,
        );
      }
    }
  }
});
