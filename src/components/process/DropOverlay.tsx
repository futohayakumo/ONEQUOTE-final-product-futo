"use client";

import cn from "clsx";
import type { ProcessMode, StepId } from "@/types/process-scene";
import { STEP_IDS, STEP_LABEL } from "./model/processModel";

/**
 * The pointer-events firewall.
 *
 * The overlay itself is transparent to pointers; only the individual drop
 * zones catch them. That way the DOM drag layer never has to hit-test inside a
 * canvas, and the renderer never has to know HTML5 drag and drop exists.
 *
 * The asymmetry between modes is deliberate. In the traditional room the step
 * you choose changes the cycle time, so there are five discrete targets. In the
 * AI-driven room the whole claim is that there is no queue to choose and no
 * hand-off to aim at, so the entire surface accepts a drop.
 */
export function DropOverlay({
  mode,
  hovered,
  armed,
  onHover,
  onDrop,
}: {
  mode: ProcessMode;
  hovered: StepId | null;
  armed: boolean;
  onHover: (step: StepId | null) => void;
  onDrop: (step: StepId, e: React.DragEvent) => void;
}) {
  const zones: StepId[] = mode === "traditional" ? [...STEP_IDS] : ["intake"];

  return (
    <div className="pointer-events-none absolute inset-0 grid" aria-hidden={!armed}>
      <div
        className={cn(
          "grid h-full w-full",
          mode === "traditional" ? "grid-cols-5" : "grid-cols-1",
        )}
      >
        {zones.map((step) => (
          <div
            key={step}
            className={cn(
              "pointer-events-auto m-1 flex items-end justify-center pb-2 transition-colors duration-150",
              hovered === step
                ? "border-2 border-crimson bg-tint/70"
                : "border-2 border-transparent",
            )}
            onDragOver={(e) => {
              // Without preventDefault the drop event never fires at all.
              e.preventDefault();
              e.dataTransfer.dropEffect = "copy";
              if (hovered !== step) onHover(step);
            }}
            onDragLeave={() => onHover(null)}
            onDrop={(e) => {
              e.preventDefault();
              onDrop(step, e);
            }}
          >
            {hovered === step ? (
              <span className="type-caption text-crimson">
                {mode === "traditional"
                  ? `Drop on ${STEP_LABEL[step]}`
                  : "Drop anywhere — the belt takes it"}
              </span>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
