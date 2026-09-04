"use client";

import cn from "clsx";
import type { ProcessMode, StepId, StoryPoint } from "@/types/process-scene";
import { STEP_IDS } from "./model/processModel";
import { AGENCY_LABEL, GAP_REASON, STATIONS } from "./scene/stations";

/**
 * The narrow-screen form of the station overlay.
 *
 * Below the large breakpoint the five cards cannot sit side by side over the
 * model without overlapping, so the same content becomes a vertical list with
 * the queues interleaved between the steps — which is arguably the clearer
 * reading of a pipeline anyway. It also carries the whole story for anyone who
 * cannot see the canvas.
 */
export function StationList({
  mode,
  armed,
  activeStep,
  activePhase,
  activeWaitDays,
  queueDepths,
  onDrop,
}: {
  mode: ProcessMode;
  armed: StoryPoint | null;
  activeStep: StepId | null;
  activePhase: "work" | "wait" | null;
  activeWaitDays: number;
  queueDepths: number[];
  onDrop: (step: StepId, sp: StoryPoint) => void;
}) {
  return (
    <ol className="flex flex-col gap-3 lg:hidden">
      {STEP_IDS.map((step, i) => {
        const info = STATIONS[step];
        const agency = info.agency[mode];
        const isActive = activeStep === step;
        const waitingHere =
          mode === "traditional" &&
          activePhase === "wait" &&
          activeStep === step &&
          i > 0;

        return (
          <li key={step} className="flex flex-col gap-3">
            {i > 0 ? (
              <div
                className={cn(
                  "border px-4 py-2 rounded-sharp",
                  waitingHere
                    ? "border-2 border-crimson bg-tint"
                    : "border-border bg-studio",
                )}
              >
                <div className="flex items-baseline justify-between gap-3">
                  <span className="type-caption">
                    {mode === "traditional" ? "Queue" : "No queue"}
                  </span>
                  <span className="type-caption tnum text-charcoal">
                    {mode === "traditional" ? (queueDepths[i - 1] ?? 0) : 0}
                  </span>
                </div>
                <p className="mt-0.5 type-caption">
                  {mode === "traditional"
                    ? GAP_REASON[i - 1]
                    : "Nothing waits here. Work carries straight on."}
                </p>
                {waitingHere ? (
                  <p className="mt-1 type-caption tnum text-crimson">
                    Waiting {activeWaitDays.toFixed(1)} d
                  </p>
                ) : null}
              </div>
            ) : null}

            <div
              className={cn(
                "border p-4 rounded-sharp",
                isActive && activePhase === "work"
                  ? "border-2 border-crimson"
                  : "border-border bg-studio",
              )}
            >
              <div className="flex items-baseline justify-between gap-3">
                <span className="type-caption tnum">0{info.no}</span>
                <span
                  className={cn(
                    "type-caption",
                    agency === "automated"
                      ? "text-crimson"
                      : agency === "assisted"
                        ? "text-charcoal"
                        : "text-muted",
                  )}
                >
                  {AGENCY_LABEL[agency]}
                </span>
              </div>
              <p className="mt-1 type-label">{info.name[mode]}</p>
              <p className="mt-1 type-caption">{info.does[mode]}</p>
              {isActive && activePhase === "work" ? (
                <p className="mt-2 border-t border-border pt-2 type-caption text-crimson">
                  Working on it now
                </p>
              ) : null}
              {armed !== null ? (
                <button
                  type="button"
                  onClick={() => onDrop(step, armed)}
                  className="mt-3 w-full border border-crimson px-3 py-2 type-caption text-crimson rounded-sharp transition-colors duration-150 hover:bg-tint"
                >
                  Enter {armed} SP here
                </button>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
