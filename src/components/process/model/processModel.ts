import type {
  PerStepTiming,
  ProcessMode,
  StepId,
  StoryPoint,
} from "@/types/process-scene";

/**
 * Runtime constants live here rather than in the types module, so this file
 * has NO runtime imports at all and can be executed directly by the node test
 * runner (which does not know the "@/" alias).
 */
export const STORY_POINTS: readonly StoryPoint[] = [0.5, 1, 2, 3, 5, 8];

export const STEP_IDS: readonly StepId[] = [
  "intake",
  "analysis",
  "dev",
  "test",
  "deploy",
];

export const STEP_LABEL: Record<StepId, string> = {
  intake: "Intake",
  analysis: "Analysis",
  dev: "Dev",
  test: "Test",
  deploy: "Deploy",
};

/**
 * The delivery timing model. Deliberately free of any `three` import so the
 * WebGL scene, the 2D readout, and the no-WebGL fallback all compute identical
 * numbers from this one source.
 *
 * The constants below are a model, not a measurement. They are chosen so that
 * the SHAPE of the result carries the argument: queue wait in the traditional
 * room is superlinear in batch size (sp^1.3) while the AI-driven room is
 * near-flat, so the advantage GROWS with story-point size. That is the
 * Little's-Law point of the whole screen, and it emerges rather than being
 * asserted.
 */
export const MODEL = {
  /** Relative effort per step. Dev dominates; deploy is nearly free. */
  STEP_WEIGHT: {
    intake: 0.6,
    analysis: 1.0,
    dev: 2.2,
    test: 1.4,
    deploy: 0.5,
  } as Record<StepId, number>,

  /** Days of hands-on work per unit of weight per story point. */
  TOUCH_K: 0.3,

  /** Ordinary hand-off queue between two steps. */
  QUEUE_BASE: 0.4,
  QUEUE_K: 0.25,

  /**
   * The last gap is the Pull Request gate. Under the Agile Delivery Protocol a
   * merge needs two independent approvals, so this queue is both longer to
   * start with and steeper in batch size — a big change is harder to get two
   * people to read.
   */
  PR_QUEUE_BASE: 1.2,
  PR_QUEUE_K: 0.55,

  /** Superlinear: bigger batches wait disproportionately longer. */
  QUEUE_EXPONENT: 1.3,

  /** AI-driven room. Continuous flow, so these are near-flat in sp. */
  BELT_BASE: 0.4,
  BELT_K: 0.14,
  CHECKPOINT_DAYS: 0.02,
  CHECKPOINT_COUNT: 3,
  CONSOLE_BASE: 0.2,
  CONSOLE_K: 0.09,
} as const;

export function touchDays(step: StepId, sp: number): number {
  return MODEL.TOUCH_K * MODEL.STEP_WEIGHT[step] * sp;
}

/** `gapIndex` 0..3. Index 3 is the PR / approval gate. */
export function queueDays(gapIndex: number, sp: number): number {
  const scaled = Math.pow(sp, MODEL.QUEUE_EXPONENT);
  return gapIndex < 3
    ? MODEL.QUEUE_BASE + MODEL.QUEUE_K * scaled
    : MODEL.PR_QUEUE_BASE + MODEL.PR_QUEUE_K * scaled;
}

export function beltDays(sp: number): number {
  return MODEL.BELT_BASE + MODEL.BELT_K * sp;
}

export function checkpointDays(): number {
  return MODEL.CHECKPOINT_DAYS * MODEL.CHECKPOINT_COUNT;
}

export function consoleDays(sp: number): number {
  return MODEL.CONSOLE_BASE + MODEL.CONSOLE_K * sp;
}

export interface Schedule {
  mode: ProcessMode;
  sp: StoryPoint;
  startStep: StepId;
  steps: StepId[];
  perStep: PerStepTiming[];
  touchDays: number;
  waitDays: number;
  totalDays: number;
  flowEfficiency: number;
  wallMs: number;
}

export function stepsFrom(startStep: StepId): StepId[] {
  const i = STEP_IDS.indexOf(startStep);
  return STEP_IDS.slice(i === -1 ? 0 : i) as StepId[];
}

/**
 * Wall-clock compression. Playing 35.5 days linearly would make the AI-driven
 * run unwatchably short or the traditional one tediously long, so the mapping
 * is compressed — but the PROPORTIONS inside a single run stay faithful,
 * because every segment is scaled by the same factor.
 */
export function wallSeconds(days: number): number {
  return 0.9 + Math.pow(days, 0.62);
}

export function buildSchedule(
  mode: ProcessMode,
  sp: StoryPoint,
  startStep: StepId = "intake",
): Schedule {
  const steps = stepsFrom(startStep);
  const offset = STEP_IDS.indexOf(startStep);

  let perStep: PerStepTiming[];

  if (mode === "traditional") {
    perStep = steps.map((stepId, i) => ({
      stepId,
      workDays: touchDays(stepId, sp),
      // The queue sits BEFORE every step except the first one entered.
      waitDays: i === 0 ? 0 : queueDays(offset + i - 1, sp),
    }));
  } else {
    // Same five steps, but they happen on a moving belt with no queues.
    // Distributing by the same weights keeps the readout comparable row for row.
    const total = beltDays(sp) + checkpointDays() + consoleDays(sp);
    const weightSum = steps.reduce((a, s) => a + MODEL.STEP_WEIGHT[s], 0);
    perStep = steps.map((stepId) => ({
      stepId,
      workDays: (total * MODEL.STEP_WEIGHT[stepId]) / weightSum,
      waitDays: 0,
    }));
  }

  const touch = perStep.reduce((a, s) => a + s.workDays, 0);
  const wait = perStep.reduce((a, s) => a + s.waitDays, 0);
  const totalDays = touch + wait;

  return {
    mode,
    sp,
    startStep,
    steps,
    perStep,
    touchDays: round2(touch),
    waitDays: round2(wait),
    totalDays: round2(totalDays),
    flowEfficiency: totalDays === 0 ? 1 : touch / totalDays,
    wallMs: Math.round(wallSeconds(totalDays) * 1000),
  };
}

/** Both modes for the same story point — what the 2D readout displays. */
export function compare(sp: StoryPoint, startStep: StepId = "intake") {
  const traditional = buildSchedule("traditional", sp, startStep);
  const aiDriven = buildSchedule("ai-driven", sp, startStep);
  return {
    traditional,
    aiDriven,
    ratio: aiDriven.totalDays === 0 ? 0 : traditional.totalDays / aiDriven.totalDays,
  };
}

function round2(x: number): number {
  return Math.round(x * 100) / 100;
}
