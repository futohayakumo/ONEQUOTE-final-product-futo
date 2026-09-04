import type {
  ItemPhase,
  ProcessMode,
  StationId,
  StepId,
  StoryPoint,
  WorkItemProgress,
  WorkItemResult,
} from "@/types/process-scene";
import { STEP_IDS, buildSchedule } from "../model/processModel";
import { SEED_BACKLOG } from "./layout";

/**
 * A plain, non-React runtime. Held in a ref OUTSIDE <Canvas> and ticked by a
 * single useFrame inside it.
 *
 * Nothing here calls setState. Positions are mutated directly and progress
 * reaches React through a throttled emitter, so the 2D panel updates about
 * seven times a second instead of sixty.
 */

export interface Segment {
  stepId: StepId;
  kind: "work" | "wait";
  startMs: number;
  endMs: number;
  days: number;
}

export interface WorkItem {
  id: string;
  sp: StoryPoint;
  mode: ProcessMode;
  startStep: StepId;
  startedAt: number;
  totalWallMs: number;
  totalDays: number;
  touchDays: number;
  waitDays: number;
  flowEfficiency: number;
  perStep: { stepId: StepId; workDays: number; waitDays: number }[];
  segments: Segment[];
  cancelled: boolean;
  lastEmit: number;
}

export interface RuntimeHandlers {
  onItemProgress?: (p: WorkItemProgress) => void;
  onItemComplete?: (r: WorkItemResult) => void;
  /**
   * Fires only when the SET of in-flight items changes — on spawn, completion
   * or cancellation. Never per frame, so React can safely own this list while
   * positions stay outside React entirely.
   */
  onItemsChanged?: (items: WorkItem[]) => void;
}

const EMIT_INTERVAL_MS = 150;
/** A pile grows while you wait. That is the entire metaphor. */
const BACKLOG_GROWTH_MS = 1800;

let seq = 0;

export class WorkItemRuntime {
  items: WorkItem[] = [];
  handlers: RuntimeHandlers = {};
  mode: ProcessMode = "traditional";
  hoveredStep: StepId | null = null;
  /** Per-gap queue depth in the traditional room. Index 0..3. */
  backlog: number[] = [...SEED_BACKLOG];
  /**
   * Stations currently holding an item. Maintained in tick() and read directly
   * by the meshes in their own useFrame, so an item arriving at a desk never
   * costs a React render.
   */
  busyStations = new Set<StepId>();
  private backlogTimer = 0;

  private publish() {
    this.handlers.onItemsChanged?.([...this.items]);
  }

  reset() {
    this.items = [];
    this.backlog = [...SEED_BACKLOG];
    this.backlogTimer = 0;
    this.publish();
  }

  setMode(mode: ProcessMode) {
    if (mode === this.mode) return;
    this.mode = mode;
    // In-flight items are cancelled by a mode change and must NOT report a
    // completion — the run they were measuring no longer exists.
    this.items = [];
    this.backlog = [...SEED_BACKLOG];
    this.publish();
  }

  spawn(sp: StoryPoint, step?: StepId): string {
    const startStep = step ?? this.hoveredStep ?? "intake";
    const schedule = buildSchedule(this.mode, sp, startStep);

    const segments: Segment[] = [];
    let acc = 0;
    for (const p of schedule.perStep) {
      if (p.waitDays > 0) {
        const share = p.waitDays / schedule.totalDays;
        segments.push({
          stepId: p.stepId,
          kind: "wait",
          startMs: acc * schedule.wallMs,
          endMs: (acc + share) * schedule.wallMs,
          days: p.waitDays,
        });
        acc += share;
      }
      const share = p.workDays / schedule.totalDays;
      segments.push({
        stepId: p.stepId,
        kind: "work",
        startMs: acc * schedule.wallMs,
        endMs: (acc + share) * schedule.wallMs,
        days: p.workDays,
      });
      acc += share;
    }

    seq += 1;
    const id = `wi-${seq}`;
    this.items.push({
      id,
      sp,
      mode: this.mode,
      startStep,
      startedAt: performance.now(),
      totalWallMs: schedule.wallMs,
      totalDays: schedule.totalDays,
      touchDays: schedule.touchDays,
      waitDays: schedule.waitDays,
      flowEfficiency: schedule.flowEfficiency,
      perStep: schedule.perStep,
      segments,
      cancelled: false,
      lastEmit: 0,
    });
    this.publish();
    return id;
  }

  cancel(id: string) {
    this.items = this.items.filter((i) => i.id !== id);
    this.publish();
  }

  /** Where an item is right now, and how far into that segment. */
  locate(item: WorkItem, now: number) {
    const t = now - item.startedAt;
    const seg =
      item.segments.find((s) => t >= s.startMs && t < s.endMs) ??
      item.segments[item.segments.length - 1];
    const span = Math.max(1, seg.endMs - seg.startMs);
    const local = Math.min(1, Math.max(0, (t - seg.startMs) / span));
    const overall = Math.min(1, t / Math.max(1, item.totalWallMs));
    return { seg, local, overall, t };
  }

  tick(_dt: number, now: number, invalidate: () => void): boolean {
    let busy = false;

    // Backlog grows while anything is waiting in the traditional room.
    if (this.mode === "traditional") {
      const anyWaiting = this.items.some(
        (i) => this.locate(i, now).seg.kind === "wait",
      );
      if (anyWaiting) {
        this.backlogTimer += 16;
        if (this.backlogTimer >= BACKLOG_GROWTH_MS) {
          this.backlogTimer = 0;
          for (const i of this.items) {
            const { seg } = this.locate(i, now);
            if (seg.kind !== "wait") continue;
            const gap = Math.max(0, STEP_IDS.indexOf(seg.stepId) - 1);
            this.backlog[gap] = Math.min(16, this.backlog[gap] + 1);
          }
        }
      }
    }

    const finished: WorkItem[] = [];

    this.busyStations.clear();

    for (const item of this.items) {
      const { seg, local, overall, t } = this.locate(item, now);

      if (t >= item.totalWallMs) {
        finished.push(item);
        continue;
      }

      busy = true;
      if (seg.kind === "work") this.busyStations.add(seg.stepId);

      if (now - item.lastEmit >= EMIT_INTERVAL_MS) {
        item.lastEmit = now;
        const stepIndex = Math.max(0, item.segments.indexOf(seg));
        const phase: ItemPhase = seg.kind === "wait" ? "waiting" : "working";
        const station: StationId =
          item.mode === "traditional" ? seg.stepId : "belt";
        const gap = Math.max(0, STEP_IDS.indexOf(seg.stepId) - 1);

        this.handlers.onItemProgress?.({
          itemId: item.id,
          sp: item.sp,
          mode: item.mode,
          station,
          stepIndex,
          phase,
          overallProgress: overall,
          elapsedDays: item.totalDays * overall,
          elapsedMs: t,
          queueDepth:
            item.mode === "traditional" && seg.kind === "wait"
              ? this.backlog[gap]
              : 0,
        });
      }

      void local;
    }

    if (finished.length > 0) {
      this.items = this.items.filter((i) => !finished.includes(i));
      this.publish();
      for (const item of finished) {
        // A pile shrinks by one when its item is finally released.
        if (item.mode === "traditional") {
          for (let g = 0; g < this.backlog.length; g += 1) {
            this.backlog[g] = Math.max(0, this.backlog[g] - (g === 3 ? 1 : 0));
          }
        }
        this.handlers.onItemComplete?.({
          itemId: item.id,
          sp: item.sp,
          mode: item.mode,
          totalDays: item.totalDays,
          touchDays: item.touchDays,
          waitDays: item.waitDays,
          flowEfficiency: item.flowEfficiency,
          perStep: item.perStep,
          wallMs: item.totalWallMs,
          completedAt: Date.now(),
        });
      }
      busy = true;
    }

    if (busy) invalidate();
    return busy;
  }
}
