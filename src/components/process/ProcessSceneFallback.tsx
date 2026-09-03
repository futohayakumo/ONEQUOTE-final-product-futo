"use client";

import cn from "clsx";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import type {
  ProcessSceneHandle,
  ProcessSceneProps,
  StepId,
  StoryPoint,
  WorkItemResult,
} from "@/types/process-scene";
import { STEP_IDS, STEP_LABEL, buildSchedule } from "./model/processModel";

/**
 * The no-WebGL rendering of the pipeline. Implements the SAME props and the
 * SAME imperative handle as <ProcessScene />, and imports the SAME timing
 * model — so the cycle-time numbers and every callback payload are identical.
 * The argument survives with no GPU.
 *
 * Screen 5 is built against this first; swapping in the 3D scene must not
 * require a single change at the call site.
 */

interface Flight {
  itemId: string;
  sp: StoryPoint;
  startStep: StepId;
  startedAt: number;
  totalWallMs: number;
  /** Wall-clock ms at which each step in the run begins. */
  marks: { stepId: StepId; startMs: number; endMs: number }[];
}

let seq = 0;

export const ProcessSceneFallback = forwardRef<
  ProcessSceneHandle,
  ProcessSceneProps
>(function ProcessSceneFallback(
  { mode, onItemComplete, onItemProgress, onDropTargetChange, onReady, className },
  ref,
) {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [hovered, setHovered] = useState<StepId | null>(null);
  const [, force] = useState(0);
  const raf = useRef<number | null>(null);
  const flightsRef = useRef<Flight[]>([]);
  flightsRef.current = flights;

  useEffect(() => {
    onReady?.();
  }, [onReady]);

  // One rAF loop advances every in-flight item and retires the finished ones.
  useEffect(() => {
    if (flights.length === 0) return;

    const tick = () => {
      const now = performance.now();
      const done: Flight[] = [];

      for (const f of flightsRef.current) {
        if (now - f.startedAt >= f.totalWallMs) done.push(f);
      }

      if (done.length > 0) {
        setFlights((prev) => prev.filter((f) => !done.includes(f)));
        for (const f of done) {
          const s = buildSchedule(mode, f.sp, f.startStep);
          const result: WorkItemResult = {
            itemId: f.itemId,
            sp: f.sp,
            mode,
            totalDays: s.totalDays,
            touchDays: s.touchDays,
            waitDays: s.waitDays,
            flowEfficiency: s.flowEfficiency,
            perStep: s.perStep,
            wallMs: s.wallMs,
            completedAt: Date.now(),
          };
          onItemComplete?.(result);
        }
      }

      force((n) => n + 1);
      raf.current = requestAnimationFrame(tick);
    };

    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current !== null) cancelAnimationFrame(raf.current);
    };
  }, [flights.length, mode, onItemComplete, onItemProgress]);

  const dropItem = useCallback(
    (sp: StoryPoint) => {
      const startStep: StepId = hovered ?? "intake";
      const s = buildSchedule(mode, sp, startStep);

      let acc = 0;
      const marks = s.perStep.map((p) => {
        const share = (p.workDays + p.waitDays) / s.totalDays;
        const startMs = acc * s.wallMs;
        acc += share;
        return { stepId: p.stepId, startMs, endMs: acc * s.wallMs };
      });

      seq += 1;
      const itemId = `wi-${seq}`;
      setFlights((prev) => [
        ...prev,
        {
          itemId,
          sp,
          startStep,
          startedAt: performance.now(),
          totalWallMs: s.wallMs,
          marks,
        },
      ]);
      return itemId;
    },
    [hovered, mode],
  );

  useImperativeHandle(
    ref,
    () => ({
      dropItem: (sp: StoryPoint) => dropItem(sp),
      hitTest: () => hovered,
      setHoveredStep: (step) => {
        setHovered(step);
        onDropTargetChange?.(step);
      },
      cancelItem: (id) =>
        setFlights((prev) => prev.filter((f) => f.itemId !== id)),
      reset: () => setFlights([]),
      captureFrame: () => "",
    }),
    [dropItem, hovered, onDropTargetChange],
  );

  const now = performance.now();

  return (
    <div
      className={cn(
        "flex h-full w-full flex-col justify-center gap-6 p-6",
        className,
      )}
    >
      <div className="grid grid-cols-5 gap-2">
        {STEP_IDS.map((stepId, i) => {
          const occupied = flights.filter((f) => {
            const t = now - f.startedAt;
            const m = f.marks.find((mm) => mm.stepId === stepId);
            return m && t >= m.startMs && t < m.endMs;
          });

          // Queue depth is a traditional-room phenomenon only.
          const queued =
            mode === "traditional" ? Math.max(0, 3 - Math.min(i, 2)) : 0;

          return (
            <div key={stepId} className="flex flex-col gap-2">
              <div
                className={cn(
                  "flex min-h-[5.5rem] flex-col justify-between p-3 rounded-sharp transition-colors duration-150",
                  hovered === stepId
                    ? "border-2 border-crimson bg-tint"
                    : "border border-border bg-studio",
                )}
              >
                <span className="type-caption tnum">{i + 1}</span>
                <span className="type-label">{STEP_LABEL[stepId]}</span>
                <span className="flex h-4 gap-1">
                  {occupied.map((f) => (
                    <span
                      key={f.itemId}
                      className="h-3 w-3 bg-crimson"
                      title={`${f.sp} SP`}
                    />
                  ))}
                </span>
              </div>

              {/* The pile-up. Absent by construction in the AI-driven room. */}
              <div className="flex h-10 flex-col-reverse items-center gap-0.5">
                {Array.from({ length: queued }).map((_, k) => (
                  <span
                    key={k}
                    className="h-2 w-6 border border-border bg-studio"
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <p className="type-caption">
        {mode === "traditional"
          ? "Work moves in discrete steps. A queue forms before every hand-off, and the gate before Deploy waits on two approvals."
          : "Work moves continuously. There is no queue to join and no hand-off to wait on."}
      </p>
    </div>
  );
});
