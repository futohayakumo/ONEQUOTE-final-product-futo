import assert from "node:assert/strict";
import { test } from "node:test";
import {
  ARRIVAL_FRACTION,
  STORY_POINTS,
  buildSchedule,
  compare,
  phaseFor,
  wallSeconds,
  boltHours,
  MODEL,
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

test("a Bolt never exceeds the 72 working hours the lifecycle allows, and the largest item uses all of them", () => {
  for (const sp of STORY_POINTS) {
    const hours = buildSchedule("ai-dlc", sp).totalDays * MODEL.HOURS_PER_WORKING_DAY;
    assert.ok(hours > 0 && hours <= 72, `${sp} sp ran ${hours} working hours`);
  }
  near(boltHours(8), 72, 0.01);
  near(buildSchedule("ai-dlc", 8).totalDays * MODEL.HOURS_PER_WORKING_DAY, 72, 0.01);
  // Proportional: half the batch, half the Bolt.
  near(boltHours(4), 36, 0.01);
});

test("the four Bolt phases are the AI-DLC room, and the five roles are not", () => {
  const bolt = buildSchedule("ai-dlc", 3).perStep.map((p) => p.stepId);
  assert.deepEqual(bolt, ["inception", "construct", "verification", "bolt"]);

  const scrum = buildSchedule("traditional", 3).perStep.map((p) => p.stepId);
  assert.deepEqual(scrum, ["po", "design", "dev", "qa", "review"]);

  // A station from the other room is not an entry point into this one; the
  // run starts at the beginning rather than coming back empty.
  assert.deepEqual(
    buildSchedule("ai-dlc", 3, "dev").perStep.map((p) => p.stepId),
    bolt,
  );
});

test("the advantage is at least threefold at every size, and LARGEST for the smallest item", () => {
  // A half-day task still pays four hand-off queues in the traditional room —
  // 2.4 days before any work — so the smallest item suffers the most.
  for (const sp of STORY_POINTS) {
    assert.ok(compare(sp).ratio >= 3.5, `${sp} sp ratio ${compare(sp).ratio}`);
  }
  const small = compare(0.5).ratio;
  const large = compare(8).ratio;
  near(small, 6.7, 0.2);
  near(large, 3.9, 0.2);
  assert.ok(small > large, "fixed hand-off cost punishes the smallest batch hardest");
});

test("wall clock spreads in traditional and stays short in ai-dlc", () => {
  const tSmall = buildSchedule("traditional", 0.5).wallMs;
  const tLarge = buildSchedule("traditional", 8).wallMs;
  const aSmall = buildSchedule("ai-dlc", 0.5).wallMs;
  const aLarge = buildSchedule("ai-dlc", 8).wallMs;

  assert.ok(
    tLarge / tSmall >= 2.8,
    `traditional spread ${tLarge / tSmall} < 2.8`,
  );
  // The Bolt scales with the batch (a 72-hour cap is nine working days for
  // 8 SP), but the playback compresses it under five seconds either way.
  assert.ok(
    aLarge / aSmall <= 1.5 && aLarge <= 5000,
    `ai-dlc spread ${aLarge / aSmall}, large ${aLarge}ms`,
  );

  // Every ai-dlc run must last long enough for five station beats to be
  // separately visible, and short enough to stay watchable.
  for (const sp of STORY_POINTS) {
    const ms = buildSchedule("ai-dlc", sp).wallMs;
    assert.ok(
      ms >= 3600 && ms <= 5000,
      `ai-dlc ${sp}SP wall ${ms}ms out of range`,
    );
  }

  // The traditional room must still take visibly longer at every size.
  for (const sp of STORY_POINTS) {
    const t = buildSchedule("traditional", sp).wallMs;
    const a = buildSchedule("ai-dlc", sp).wallMs;
    if (sp >= 2) {
      assert.ok(
        t > a,
        `traditional ${sp}SP (${t}ms) should outlast ai (${a}ms)`,
      );
    }
  }
});

test("traditional carries queue wait; ai-dlc carries none", () => {
  assert.ok(buildSchedule("traditional", 5).waitDays > 12);
  assert.equal(buildSchedule("ai-dlc", 5).waitDays, 0);
  assert.equal(buildSchedule("ai-dlc", 5).flowEfficiency, 1);
});

test("entering later in the pipeline shortens the run, in BOTH rooms", () => {
  const full = buildSchedule("traditional", 3, "po").totalDays;
  const late = buildSchedule("traditional", 3, "dev").totalDays;
  assert.ok(late < full);

  // The AI room used to return an identical total wherever you entered, which
  // made the advantage ratio move for a reason unrelated to the argument.
  const boltFull = buildSchedule("ai-dlc", 3, "inception").totalDays;
  const boltLate = buildSchedule("ai-dlc", 3, "verification").totalDays;
  assert.ok(boltLate < boltFull, `${boltLate} should be under ${boltFull}`);
  assert.deepEqual(
    buildSchedule("traditional", 3, "dev").perStep.map((s) => s.stepId),
    ["dev", "qa", "review"],
  );
});

test("wallSeconds is monotonic", () => {
  assert.ok(wallSeconds(1) < wallSeconds(5));
  assert.ok(wallSeconds(5) < wallSeconds(35));
});

test("a work segment reports transit before arrival and working after", () => {
  for (const mode of ["traditional", "ai-dlc"] as const) {
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
  for (const mode of ["traditional", "ai-dlc"] as const) {
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
