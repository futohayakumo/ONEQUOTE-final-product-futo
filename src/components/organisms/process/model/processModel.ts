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

/**
 * Which stations belong to which room. The one place that decides it.
 */
export const MODE_STEPS: Record<ProcessMode, readonly StepId[]> = {
  traditional: ["po", "design", "dev", "qa", "review"],
  "ai-dlc": ["inception", "construct", "verification", "bolt"],
};

export function stepsOf(mode: ProcessMode): readonly StepId[] {
  return MODE_STEPS[mode];
}

/** Which room a station belongs to. Every station belongs to exactly one. */
export function modeOfStep(step: StepId): ProcessMode {
  return MODE_STEPS.traditional.includes(step) ? "traditional" : "ai-dlc";
}

/**
 * The five stations are ROLES, because a queue forms in front of a person and
 * not in front of a verb.
 *
 * They used to be stages — Intake, Analysis, Dev, Test, Deploy — and that was
 * wrong in a way worth recording. Nobody's job title is "intake", and "deploy"
 * is a pipeline rather than a person, so a room with five desks and five
 * seated workers was labelled with two things that never sit at a desk. On a
 * scrum team the work is held, in turn, by the product owner, a designer, a
 * developer, QA, and then by two other developers who have to read the pull
 * request before it can merge. Those are the five hands it passes through, and
 * every one of the four gaps between them is a real hand-off.
 *
 * The Scrum Master is deliberately not a station. Work is never queued in
 * front of them — their job is to shrink the four queues that are drawn here,
 * which is a different thing from being one of them.
 *
 * The AI-DLC side is not roles at all, and that is the point: inside one Bolt
 * there is nobody to hand to. The four names are the four phases of the cycle.
 */
export const STEP_LABEL: Record<StepId, string> = {
  po: "Product Owner",
  design: "Designer",
  dev: "Developer",
  qa: "QA",
  review: "Reviewers",
  inception: "Inception",
  construct: "2-PC Construct",
  verification: "Verification",
  bolt: "The Bolt",
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
  /**
   * Relative effort per role. The developer dominates; reading a pull request
   * is the least of the five in hands-on minutes and, because it needs two
   * people free at once, much the worst in waiting.
   */
  STEP_WEIGHT: {
    po: 0.6,
    design: 1.0,
    dev: 2.2,
    qa: 1.4,
    review: 0.5,
    // Inside a Bolt these split the cycle rather than the effort. Construct
    // carries the most because it is two passes — the AI proposes a design, a
    // person reads it, and only then is anything generated. Verification is
    // wall-clock for a bot suite and almost no human minutes at all.
    inception: 1.2,
    construct: 1.6,
    verification: 0.8,
    bolt: 0.4,
  } as Record<StepId, number>,

  /** Days of hands-on work per unit of weight per story point. */
  TOUCH_K: 0.3,

  /** Ordinary hand-off queue between two steps. */
  QUEUE_BASE: 0.4,
  QUEUE_K: 0.25,

  /**
   * The last gap is the queue in front of the reviewers. Under the Agile
   * Delivery Protocol a merge needs two independent approvals, so this queue
   * is both longer to start with and steeper in batch size — a big change is
   * harder to get two people to read.
   */
  PR_QUEUE_BASE: 1.2,
  PR_QUEUE_K: 0.55,

  /** Superlinear: bigger batches wait disproportionately longer. */
  QUEUE_EXPONENT: 1.3,

  /**
   * The Bolt, anchored to the window the lifecycle specifies rather than to
   * constants picked to draw a curve.
   *
   * AI-DLC states one number about itself: requirements to production in 24 to
   * 72 hours. So the smallest item takes a day and the largest takes three,
   * and everything between is linear in batch size. It is still a model — the
   * mapping from story points to hours is ours — but the endpoints belong to
   * the process, which is one more thing on this page that was not invented.
   */
  BOLT_MIN_DAYS: 1.0,
  BOLT_MAX_DAYS: 3.0,
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

/**
 * One Bolt, end to end, for a batch of `sp`.
 *
 * Linear between the two endpoints the lifecycle names: 24 hours for the
 * smallest item on the tray, 72 for the largest. Nothing here is superlinear,
 * because nothing inside a Bolt queues — that is the whole structural claim,
 * and it is the reason the gap against the other room widens with batch size
 * rather than staying flat.
 */
export function boltDays(sp: number): number {
  const lo = STORY_POINTS[0];
  const hi = STORY_POINTS[STORY_POINTS.length - 1];
  const t = (sp - lo) / (hi - lo);
  return MODEL.BOLT_MIN_DAYS + t * (MODEL.BOLT_MAX_DAYS - MODEL.BOLT_MIN_DAYS);
}

/**
 * Fraction of a work segment spent travelling to the station before the item
 * lands. Mirrored by the scene's motion, so a station never lights up, and no
 * label ever claims work is underway, before the item has arrived.
 */
export const ARRIVAL_FRACTION: Record<ProcessMode, number> = {
  traditional: 0.16,
  "ai-dlc": 0.58,
};

export type SegmentKind = "work" | "wait";

/**
 * The phase an item is in. Extracted and made pure because folding transit in
 * with "no phase" once made the readout announce "Finished" for well over half
 * of every AI-driven segment, while the counter was still climbing.
 */
export function phaseFor(
  kind: SegmentKind,
  localProgress: number,
  mode: ProcessMode,
): "waiting" | "transit" | "working" {
  if (kind === "wait") return "waiting";
  return localProgress >= ARRIVAL_FRACTION[mode] ? "working" : "transit";
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

/**
 * The stations still ahead of an item that enters at `startStep`.
 *
 * Takes the mode because the two rooms no longer run the same list, and a
 * station id belongs to exactly one of them. A start step from the wrong room
 * falls back to that room's first station rather than returning an empty run.
 */
export function stepsFrom(mode: ProcessMode, startStep: StepId): StepId[] {
  const all = MODE_STEPS[mode];
  const i = all.indexOf(startStep);
  return all.slice(i === -1 ? 0 : i) as StepId[];
}

/**
 * Wall-clock compression, a PRESENTATION concern only. It never touches the
 * simulated day figures, which are what the screen actually argues with.
 *
 * Playing 35.5 days linearly would make the AI-DLC run unwatchably short or
 * the traditional one tediously long, so the mapping is compressed while the
 * proportions inside a single run stay faithful.
 *
 * The AI-DLC room gets a floor. Its whole point is four phases passing in
 * quick succession, and at 2.6s each beat lasted about half a second — too
 * fast to see a station light up at all, which made the fast side look like a
 * box sliding along a rail. The contrast is carried by the day counts, not by
 * how briefly the animation plays.
 */
const AI_MIN_PLAYBACK_SECONDS = 3.6;

export function wallSeconds(
  days: number,
  mode: ProcessMode = "traditional",
): number {
  const raw = 0.9 + Math.pow(days, 0.62);
  return mode === "ai-dlc" ? Math.max(AI_MIN_PLAYBACK_SECONDS, raw) : raw;
}

export function buildSchedule(
  mode: ProcessMode,
  sp: StoryPoint,
  startStep: StepId = "po",
): Schedule {
  const all = MODE_STEPS[mode];
  const steps = stepsFrom(mode, startStep);
  const offset = Math.max(0, all.indexOf(startStep));

  let perStep: PerStepTiming[];

  if (mode === "traditional") {
    perStep = steps.map((stepId, i) => ({
      stepId,
      workDays: touchDays(stepId, sp),
      // The queue sits BEFORE every step except the first one entered.
      waitDays: i === 0 ? 0 : queueDays(offset + i - 1, sp),
    }));
  } else {
    /*
     * One Bolt. No queue anywhere in it, so every day here is a working day.
     *
     * The cycle cost scales with how much of it the item actually traverses:
     * dropping straight into Verification is not a whole Bolt. An earlier
     * version computed one total for the whole line and merely redistributed
     * it, so entering late took exactly as long as entering at the start,
     * which made the ratio move for a reason unrelated to the argument.
     */
    const fullWeight = all.reduce((a, id) => a + MODEL.STEP_WEIGHT[id], 0);
    const weightSum = steps.reduce((a, id) => a + MODEL.STEP_WEIGHT[id], 0);
    const total = boltDays(sp) * (weightSum / fullWeight);

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
    wallMs: Math.round(wallSeconds(totalDays, mode) * 1000),
  };
}

/** Both modes for the same story point — what the 2D readout displays. */
/**
 * Both rooms for the same story point — what the 2D readout displays.
 *
 * `startStep` belongs to one room only, and buildSchedule falls back to the
 * first station of a room it does not belong to. That is the right reading:
 * an item dropped at Dev is measured from Dev against a WHOLE Bolt, because
 * there is no "halfway into a Bolt" to compare it to.
 */
export function compare(sp: StoryPoint, startStep: StepId = "po") {
  const traditional = buildSchedule("traditional", sp, startStep);
  const aiDriven = buildSchedule("ai-dlc", sp, startStep);
  return {
    traditional,
    aiDriven,
    ratio:
      aiDriven.totalDays === 0 ? 0 : traditional.totalDays / aiDriven.totalDays,
  };
}

function round2(x: number): number {
  return Math.round(x * 100) / 100;
}
