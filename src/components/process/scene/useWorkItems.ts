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
  /** Wall-clock ms at which the outbound leg begins. */
  outboundStartMs: number;
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
  /**
   * Fires whenever queue depth changes, INDEPENDENTLY of whether anything is
   * in flight. Piggybacking this on progress events meant the decay after a
   * run finished was never reported, so the number froze one above its resting
   * depth while the pile it described had already drained.
   */
  onBacklogChanged?: (backlog: number[]) => void;
}

const EMIT_INTERVAL_MS = 150;
/** A pile grows while you wait. That is the entire metaphor. */
const BACKLOG_GROWTH_MS = 1400;
/** And drains back to its resting depth once the wait is over. */
const BACKLOG_DECAY_MS = 700;

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
  /**
   * Separate accumulators. A single shared one was reset by whichever branch
   * ran last, so a work segment longer than the decay interval kept clearing
   * the growth counter and the pile almost never grew.
   */
  private growthTimer = 0;
  private decayTimer = 0;
  private pausedAt: number | null = null;

  private publish() {
    this.handlers.onItemsChanged?.([...this.items]);
  }

  private publishBacklog() {
    this.handlers.onBacklogChanged?.([...this.backlog]);
  }

  reset() {
    this.items = [];
    this.backlog = [...SEED_BACKLOG];
    this.growthTimer = 0;
    this.decayTimer = 0;
    this.publish();
    this.publishBacklog();
  }

  setMode(mode: ProcessMode) {
    if (mode === this.mode) return;
    this.mode = mode;
    // In-flight items are cancelled by a mode change and must NOT report a
    // completion — the run they were measuring no longer exists.
    this.items = [];
    this.backlog = [...SEED_BACKLOG];
    this.publish();
    this.publishBacklog();
  }

  /** Freeze every in-flight run. Time spent on another tab is not cycle time. */
  pause() {
    if (this.pausedAt === null) this.pausedAt = performance.now();
  }

  resume() {
    if (this.pausedAt === null) return;
    const away = performance.now() - this.pausedAt;
    this.pausedAt = null;
    for (const item of this.items) {
      item.startedAt += away;
      item.lastEmit += away;
    }
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

    // A short outbound leg: the item is carried to the pallet or loaded into
    // the truck. Without it the run ended by the box vanishing mid-air.
    const outboundShare = 0.12;
    const outboundStart = schedule.wallMs;
    const totalWall = Math.round(schedule.wallMs * (1 + outboundShare));

    seq += 1;
    const id = `wi-${seq}`;
    this.items.push({
      id,
      sp,
      mode: this.mode,
      startStep,
      startedAt: performance.now(),
      totalWallMs: totalWall,
      outboundStartMs: outboundStart,
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

  /**
   * Fraction of a work segment spent travelling before the item lands. Mirrors
   * the motion in SceneRoot; a station must not light up before arrival.
   */
  arrivalFraction(item: WorkItem): number {
    return item.mode === "ai-driven" ? 0.58 : 0.16;
  }

  /** Where an item is right now, and how far into that segment. */
  locate(item: WorkItem, now: number) {
    const t = now - item.startedAt;
    const outbound = t >= item.outboundStartMs;
    const seg =
      item.segments.find((s) => t >= s.startMs && t < s.endMs) ??
      item.segments[item.segments.length - 1];
    const span = Math.max(1, seg.endMs - seg.startMs);
    const local = Math.min(1, Math.max(0, (t - seg.startMs) / span));
    const overall = Math.min(1, t / Math.max(1, item.totalWallMs));
    const outboundLocal = outbound
      ? Math.min(
          1,
          (t - item.outboundStartMs) /
            Math.max(1, item.totalWallMs - item.outboundStartMs),
        )
      : 0;
    return { seg, local, overall, t, outbound, outboundLocal };
  }

  tick(dt: number, now: number, invalidate: () => void): boolean {
    if (this.pausedAt !== null) return false;
    let busy = false;
    const dtMs = Math.min(100, dt * 1000);

    // Backlog grows while anything is waiting in the traditional room.
    if (this.mode === "traditional") {
      const anyWaiting = this.items.some(
        (i) => this.locate(i, now).seg.kind === "wait",
      );
      if (anyWaiting) {
        this.decayTimer = 0;
        this.growthTimer += dtMs;
        if (this.growthTimer >= BACKLOG_GROWTH_MS) {
          this.growthTimer = 0;
          for (const i of this.items) {
            const { seg } = this.locate(i, now);
            if (seg.kind !== "wait") continue;
            const gap = Math.max(0, STEP_IDS.indexOf(seg.stepId) - 1);
            // Capped a little above the seed: the pile grows while you wait,
            // but it is illustrating a backlog, not racing to the ceiling.
            const cap = SEED_BACKLOG[gap] + 4;
            const next = Math.min(cap, this.backlog[gap] + 1);
            if (next !== this.backlog[gap]) {
              this.backlog[gap] = next;
              this.publishBacklog();
            }
          }
        }
      } else {
        // Nothing is waiting, so the queue drains back to its resting depth.
        // Without this it ratcheted up across runs and looked like drift.
        this.growthTimer = 0;
        this.decayTimer += dtMs;
        if (this.decayTimer >= BACKLOG_DECAY_MS) {
          this.decayTimer = 0;
          let changed = false;
          for (let g = 0; g < this.backlog.length; g += 1) {
            if (this.backlog[g] > SEED_BACKLOG[g]) {
              this.backlog[g] -= 1;
              changed = true;
            }
          }
          if (changed) this.publishBacklog();
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
      // A station is only busy once the item has actually ARRIVED. Marking it
      // at segment start lit the next gantry while the box was still travelling
      // towards it, which reads as the machine working on nothing.
      if (seg.kind === "work" && local >= this.arrivalFraction(item)) {
        this.busyStations.add(seg.stepId);
      }

      if (now - item.lastEmit >= EMIT_INTERVAL_MS) {
        item.lastEmit = now;
        const stepIndex = Math.max(0, item.segments.indexOf(seg));
        // "working" only once the item has actually landed. Reporting it at
        // segment start made the card claim work was happening while the box
        // was still in transit and the machine above it was dark.
        const arrived = local >= this.arrivalFraction(item);
        const phase: ItemPhase =
          seg.kind === "wait" ? "waiting" : arrived ? "working" : "transit";
        const place: StationId =
          item.mode === "traditional" ? seg.stepId : "belt";
        const gap = Math.max(0, STEP_IDS.indexOf(seg.stepId) - 1);

        this.handlers.onItemProgress?.({
          itemId: item.id,
          sp: item.sp,
          mode: item.mode,
          station: seg.stepId,
          place,
          stepIndex,
          phase,
          overallProgress: overall,
          elapsedDays:
            item.totalDays * Math.min(1, t / Math.max(1, item.outboundStartMs)),
          elapsedMs: t,
          queueDepth:
            item.mode === "traditional" && seg.kind === "wait"
              ? this.backlog[gap]
              : 0,
          segmentDays: seg.days,
          segmentElapsedDays: seg.days * local,
          backlog: [...this.backlog],
        });
      }

      void local;
    }

    if (finished.length > 0) {
      this.items = this.items.filter((i) => !finished.includes(i));
      this.publish();
      for (const item of finished) {
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
