/**
 * TYPES ONLY. Runtime constants live in components/process/model/processModel.ts
 * so that module can be executed directly by the node test runner, which has no
 * knowledge of the "@/" path alias.
 *
 * The single contract between the 2D Process Comparison screen and whatever
 * renders the pipeline (the WebGL <ProcessScene />, or <ProcessSceneFallback />).
 *
 * This file must stay free of any `three` / `@react-three/*` import so the 2D
 * UI and the no-WebGL fallback can depend on it without pulling in a renderer.
 */

export type ProcessMode = "traditional" | "ai-dlc";

export type StoryPoint = 0.5 | 1 | 2 | 3 | 5 | 8;

/**
 * The stations, and the two rooms no longer share them.
 *
 * They used to: one list of five, rendered twice, so the AI room was the same
 * five people with a conveyor under them. That is not what AI-DLC is. The
 * lifecycle it describes does not speed the five roles up — it dissolves the
 * line they stand in and replaces it with one cycle of four phases, run by a
 * cell of one to five people inside 24 to 72 hours. Drawing the old row on a
 * belt both understates it and misreports it.
 *
 * So the traditional room keeps its five roles, the AI-DLC room gets the four
 * phases of the Bolt, and `MODE_STEPS` in processModel.ts is the only place
 * that says which belong to which.
 */
export type StepId =
  // Traditional scrum: five roles, four hand-offs between them.
  | "po"
  | "design"
  | "dev"
  | "qa"
  | "review"
  // AI-DLC: one Bolt, four phases, no hand-off inside it.
  | "inception"
  | "construct"
  | "verification"
  | "bolt";

/** Where a work item can physically be. Traditional uses its five steps; the
 *  AI-DLC room uses the belt / checkpoint / console / truck stations. */
export type StationId = StepId | "belt" | "checkpoint" | "console" | "truck";

export type ItemPhase =
  | "spawning"
  | "working"
  | "waiting"
  | "gate"
  | "transit"
  | "done"
  | "cancelled";

export interface WorkItemProgress {
  itemId: string;
  sp: StoryPoint;
  mode: ProcessMode;
  /**
   * ALWAYS the step. It previously carried "belt" in the AI-driven room, which
   * matches no StepId, so every station label stayed inert there — the fast
   * side ended up with less feedback than the slow one.
   */
  station: StepId;
  /** Where the item physically is. Presentation only; never used for matching. */
  place: StationId;
  /** 0..4 in traditional, 0..3 in ai-dlc. */
  stepIndex: number;
  phase: ItemPhase;
  /** 0..1 across the whole run. */
  overallProgress: number;
  /** Simulated days elapsed so far. */
  elapsedDays: number;
  /** Wall-clock ms elapsed so far. */
  elapsedMs: number;
  /** Items queued ahead of this one. Always 0 in ai-dlc. */
  queueDepth: number;
  /**
   * Simulated days this SEGMENT lasts — the wait at this gap, or the work at
   * this station. Distinct from elapsedDays, which is the whole run so far.
   */
  segmentDays: number;
  /** Simulated days spent in this segment so far. */
  segmentElapsedDays: number;
  /**
   * Depth of every queue, every frame. Emitted whole so the number on a card
   * and the pile it describes can never drift apart.
   */
  backlog: readonly number[];
}

export interface PerStepTiming {
  stepId: StepId;
  workDays: number;
  waitDays: number;
}

export interface WorkItemResult {
  itemId: string;
  sp: StoryPoint;
  mode: ProcessMode;
  totalDays: number;
  touchDays: number;
  waitDays: number;
  /** touchDays / totalDays. */
  flowEfficiency: number;
  perStep: PerStepTiming[];
  wallMs: number;
  completedAt: number;
}

export type SceneUnavailableReason = "no-webgl" | "context-lost" | "error";

export interface ProcessSceneProps {
  /** Source of truth for which room is shown. Changing it runs the transition. */
  mode: ProcessMode;
  /** Throttled to ~150ms per item. */
  onItemProgress?: (progress: WorkItemProgress) => void;
  /** Fires once when an item reaches the outbound pallet / truck. */
  onItemComplete?: (result: WorkItemResult) => void;
  /** Fires when a drag hovers a different step. null = not over a valid target. */
  onDropTargetChange?: (step: StepId | null) => void;
  /** Fires once the transition to `mode` has settled. */
  onModeSettled?: (mode: ProcessMode) => void;
  /** Fires once the first frame is painted. */
  onReady?: () => void;
  /** Fires if the renderer cannot run. The parent should swap in the fallback. */
  onUnavailable?: (reason: SceneUnavailableReason) => void;
  /**
   * Projected screen positions, in CSS pixels relative to the scene element,
   * for each station (and, in the traditional room, each queue gap). The
   * parent renders its labels and drop zones at these points, which is what
   * keeps the 2D overlay aligned with the 3D model.
   */
  onAnchors?: (anchors: { id: string; x: number; y: number }[]) => void;
  /**
   * Queue depth, whenever it changes and regardless of whether work is in
   * flight — so the number on a card and the pile it describes stay the same
   * fact, including while the queue drains after a run.
   */
  onBacklogChanged?: (backlog: number[]) => void;
  reducedMotion?: "auto" | "force" | "off";
  quality?: "auto" | "high" | "low";
  maxConcurrentItems?: number;
  debug?: boolean;
  className?: string;
  ariaLabel?: string;
}

export interface ProcessSceneHandle {
  /**
   * Inject a work item at a named step. The caller always knows the step,
   * because drop zones are DOM elements placed on the projected anchors.
   * Returns the item id synchronously so the 2D panel can add its row at once.
   */
  dropItem(sp: StoryPoint, step?: StepId): string;
  /** Purely visual hover state. Pass null to clear. */
  setHoveredStep(step: StepId | null): void;
  cancelItem(itemId: string): void;
  /** Clear in-flight items and restore the seeded backlog. */
  reset(): void;
  /** PNG data URL of the current frame. Used by the verification harness. */
  captureFrame(): string;
}
