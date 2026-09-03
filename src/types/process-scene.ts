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

export type ProcessMode = "traditional" | "ai-driven";

export type StoryPoint = 0.5 | 1 | 2 | 3 | 5 | 8;

export type StepId = "intake" | "analysis" | "dev" | "test" | "deploy";

/** Where a work item can physically be. Traditional uses the five steps; the
 *  AI-driven room uses the belt / checkpoint / console / truck stations. */
export type StationId =
  | StepId
  | "belt"
  | "checkpoint"
  | "console"
  | "truck";

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
  station: StationId;
  /** 0..4 in traditional, 0..3 in ai-driven. */
  stepIndex: number;
  phase: ItemPhase;
  /** 0..1 across the whole run. */
  overallProgress: number;
  /** Simulated days elapsed so far. */
  elapsedDays: number;
  /** Wall-clock ms elapsed so far. */
  elapsedMs: number;
  /** Items queued ahead of this one. Always 0 in ai-driven. */
  queueDepth: number;
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
  reducedMotion?: "auto" | "force" | "off";
  quality?: "auto" | "high" | "low";
  maxConcurrentItems?: number;
  debug?: boolean;
  className?: string;
  ariaLabel?: string;
}

export interface ProcessSceneHandle {
  /**
   * Inject a work item. `clientPoint` (viewport px) is hit-tested to pick the
   * entry step; omit it (the keyboard path) to use the mode's default entry.
   * Returns the item id synchronously so the 2D panel can add its row at once.
   */
  dropItem(sp: StoryPoint, clientPoint?: { x: number; y: number }): string;
  /** Which step is under this viewport point right now, or null. rAF-safe. */
  hitTest(clientPoint: { x: number; y: number }): StepId | null;
  /** Purely visual hover state. Pass null to clear. */
  setHoveredStep(step: StepId | null): void;
  cancelItem(itemId: string): void;
  /** Clear in-flight items and restore the seeded backlog. */
  reset(): void;
  /** PNG data URL of the current frame. Used by the verification harness. */
  captureFrame(): string;
}
