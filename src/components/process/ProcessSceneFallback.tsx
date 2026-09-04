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
import { STEP_IDS, buildSchedule } from "./model/processModel";

/**
 * The no-WebGL rendering. It implements the SAME props and handle as
 * <ProcessScene /> and imports the SAME timing model, so every number and
 * every callback payload is identical — the argument survives with no GPU.
 *
 * It also publishes anchors in the same shape, so the station overlay (labels,
 * queue markers, drop zones) renders on top of it unchanged. Screen 5 was
 * built against this first; swapping in the 3D scene changed nothing at the
 * call site.
 */

interface Flight {
  itemId: string;
  sp: StoryPoint;
  startStep: StepId;
  startedAt: number;
  totalWallMs: number;
  marks: { stepId: StepId; startMs: number; endMs: number; wait: number }[];
}

let seq = 0;

export const ProcessSceneFallback = forwardRef<
  ProcessSceneHandle,
  ProcessSceneProps
>(function ProcessSceneFallback(
  {
    mode,
    onItemComplete,
    onItemProgress,
    onDropTargetChange,
    onAnchors,
    onReady,
    className,
    ariaLabel,
  },
  ref,
) {
  const [flights, setFlights] = useState<Flight[]>([]);
  // One source of truth for depth here too, so the number and the drawn pile
  // are the same fact rather than two independent guesses.
  const backlog = useRef<number[]>([3, 3, 3, 5]);
  const [hovered, setHovered] = useState<StepId | null>(null);
  const [, force] = useState(0);
  const host = useRef<HTMLDivElement>(null);
  const slots = useRef(new Map<string, HTMLElement>());
  const raf = useRef<number | null>(null);
  const flightsRef = useRef<Flight[]>([]);
  flightsRef.current = flights;

  useEffect(() => {
    onReady?.();
  }, [onReady]);

  // Publish the same anchor shape the renderer does, measured from the DOM.
  useEffect(() => {
    const publish = () => {
      const base = host.current?.getBoundingClientRect();
      if (!base || !onAnchors) return;
      const out: { id: string; x: number; y: number }[] = [];
      slots.current.forEach((el, id) => {
        const r = el.getBoundingClientRect();
        out.push({
          id,
          x: r.left - base.left + r.width / 2,
          y: r.top - base.top + (id.startsWith("gap-") ? r.height : 0),
        });
      });
      onAnchors(out);
    };
    publish();
    const ro = new ResizeObserver(publish);
    if (host.current) ro.observe(host.current);
    window.addEventListener("resize", publish);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", publish);
    };
  }, [onAnchors, mode]);

  useEffect(() => {
    if (flights.length === 0) return;

    const tick = () => {
      const now = performance.now();
      const done = flightsRef.current.filter(
        (f) => now - f.startedAt >= f.totalWallMs,
      );

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

      // Grow the queue the item is sitting in; drain the rest back to rest.
      const resting = [3, 3, 3, 5];
      const waitingGaps = new Set<number>();
      for (const f of flightsRef.current) {
        const t = now - f.startedAt;
        const m = f.marks.find((mm) => t >= mm.startMs && t < mm.endMs);
        if (m && t < m.startMs + m.wait) {
          waitingGaps.add(STEP_IDS.indexOf(m.stepId) - 1);
        }
      }
      for (let g = 0; g < backlog.current.length; g += 1) {
        if (waitingGaps.has(g)) {
          backlog.current[g] = Math.min(
            resting[g] + 4,
            backlog.current[g] + 0.02,
          );
        } else if (backlog.current[g] > resting[g]) {
          backlog.current[g] = Math.max(resting[g], backlog.current[g] - 0.04);
        }
      }

      for (const f of flightsRef.current) {
        const t = now - f.startedAt;
        const m = f.marks.find((mm) => t >= mm.startMs && t < mm.endMs);
        if (!m) continue;
        const s = buildSchedule(mode, f.sp, f.startStep);
        const step = s.perStep.find((p) => p.stepId === m.stepId);
        const waiting = t < m.startMs + m.wait;
        const segDays = waiting ? (step?.waitDays ?? 0) : (step?.workDays ?? 0);
        const segSpan = waiting ? m.wait : m.endMs - m.startMs - m.wait;
        const segInto = waiting ? t - m.startMs : t - m.startMs - m.wait;
        onItemProgress?.({
          itemId: f.itemId,
          sp: f.sp,
          mode,
          station: m.stepId,
          place: mode === "traditional" ? m.stepId : "belt",
          stepIndex: STEP_IDS.indexOf(m.stepId),
          phase: waiting ? "waiting" : "working",
          overallProgress: t / f.totalWallMs,
          elapsedDays: s.totalDays * (t / f.totalWallMs),
          elapsedMs: t,
          queueDepth: 0,
          backlog: backlog.current.map((n) => Math.round(n)),
          segmentDays: segDays,
          segmentElapsedDays:
            segSpan > 0
              ? segDays * Math.min(1, Math.max(0, segInto / segSpan))
              : segDays,
        });
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
    (sp: StoryPoint, step?: StepId) => {
      const startStep: StepId = step ?? hovered ?? "intake";
      const s = buildSchedule(mode, sp, startStep);

      let acc = 0;
      const marks = s.perStep.map((p) => {
        const share = (p.workDays + p.waitDays) / s.totalDays;
        const startMs = acc * s.wallMs;
        acc += share;
        return {
          stepId: p.stepId,
          startMs,
          endMs: acc * s.wallMs,
          wait: (p.waitDays / s.totalDays) * s.wallMs,
        };
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
      dropItem,
      setHoveredStep: (step) => {
        setHovered(step);
        onDropTargetChange?.(step);
      },
      cancelItem: (id) =>
        setFlights((prev) => prev.filter((f) => f.itemId !== id)),
      reset: () => setFlights([]),
      captureFrame: () => "",
    }),
    [dropItem, onDropTargetChange],
  );

  const now = performance.now();
  const register = (id: string) => (el: HTMLElement | null) => {
    if (el) slots.current.set(id, el);
    else slots.current.delete(id);
  };

  return (
    <div
      ref={host}
      role="img"
      aria-label={ariaLabel}
      className={cn(
        "relative flex h-full w-full items-end px-6 pb-24 pt-40",
        className,
      )}
    >
      <div className="relative flex w-full items-end">
        {/* The line the work runs along. Solid in the AI room, broken by the
            partitions in the traditional one. */}
        <div
          className={cn(
            "absolute bottom-6 left-0 right-0 h-1",
            mode === "ai-driven" ? "bg-border" : "bg-transparent",
          )}
          aria-hidden
        />

        {STEP_IDS.map((step, i) => {
          const occupied = flights.filter((f) => {
            const t = now - f.startedAt;
            const m = f.marks.find((mm) => mm.stepId === step);
            return m && t >= m.startMs + m.wait && t < m.endMs;
          });
          const waiting =
            mode === "traditional" && i > 0
              ? flights.filter((f) => {
                  const t = now - f.startedAt;
                  const m = f.marks.find((mm) => mm.stepId === step);
                  return m && t >= m.startMs && t < m.startMs + m.wait;
                })
              : [];

          return (
            <div
              key={step}
              className="relative flex flex-1 items-end justify-center"
            >
              {i > 0 ? (
                <div
                  ref={register(`gap-${i - 1}`)}
                  className="absolute bottom-6 left-0 flex -translate-x-1/2 flex-col-reverse items-center gap-0.5"
                >
                  {mode === "traditional"
                    ? Array.from({ length: backlog.current[i - 1] ?? 3 }).map(
                        (_, k) => (
                          <span
                            key={k}
                            className="h-2 w-8 border border-border bg-studio"
                          />
                        ),
                      )
                    : null}
                  {waiting.length > 0 ? (
                    <span className="h-3 w-9 border-2 border-crimson bg-crimson" />
                  ) : null}
                </div>
              ) : null}

              <div
                ref={register(step)}
                className="flex flex-col items-center gap-2"
              >
                <span className="flex h-6 items-end gap-1">
                  {occupied.map((f) => (
                    <span key={f.itemId} className="h-4 w-4 bg-crimson" />
                  ))}
                </span>
                <span
                  className={cn(
                    "h-12 w-14 border bg-studio",
                    mode === "ai-driven" ? "border-crimson" : "border-border",
                  )}
                />
                <span className="h-6 w-px bg-border" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});
