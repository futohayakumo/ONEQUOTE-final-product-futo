"use client";

import cn from "clsx";
import type { ProcessMode, StepId, StoryPoint } from "@/types/process-scene";
import { STEP_IDS } from "./model/processModel";
import { AGENCY_LABEL, GAP_REASON, STATIONS } from "./scene/stations";

export interface Anchor {
  id: string;
  x: number;
  y: number;
}

const DND_TYPE = "application/x-story-point";

/**
 * DOM labels and drop zones positioned on the scene's PROJECTED station
 * positions, republished by the renderer whenever the camera moves.
 *
 * Two problems are solved by the same projection. The drop targets sit exactly
 * over the model instead of over a guessed 2D grid, and every station carries
 * real typography saying what happens there — which the canvas could not do
 * without a text-mesh library and a broken type scale.
 *
 * Only the horizontal position is taken from the projection. Cards are pinned
 * to a band at the top (stations) and bottom (queues) and joined to their
 * anchor by a leader line, because following the projected Y exactly makes the
 * cards climb the screen and collide.
 */
export function StationOverlay({
  anchors,
  mode,
  hovered,
  armed,
  activeStep,
  activePhase,
  activeWaitDays,
  activeWaitElapsedDays,
  queueDepths,
  onHover,
  onDrop,
}: {
  anchors: Anchor[];
  mode: ProcessMode;
  hovered: StepId | null;
  armed: StoryPoint | null;
  activeStep: StepId | null;
  activePhase: "work" | "wait" | "transit" | null;
  /** How long this gap holds the item in total. */
  activeWaitDays: number;
  /** How much of that has elapsed. */
  activeWaitElapsedDays: number;
  queueDepths: number[];
  onHover: (step: StepId | null) => void;
  onDrop: (step: StepId, sp: StoryPoint) => void;
}) {
  const byId = new Map(anchors.map((a) => [a.id, a]));
  const CARD_TOP = 8;

  /**
   * Queue cards share one baseline rather than each following its own
   * projected Y. The gaps sit at slightly different depths, so tracking Y
   * exactly staggers the cards down the screen and they start overlapping the
   * desks. One row reads as one row.
   */
  const queueBaseline =
    anchors
      .filter((a) => a.id.startsWith("gap-"))
      .reduce((max, a) => Math.max(max, a.y), 0) + 18;

  return (
    <div className="pointer-events-none absolute inset-0 hidden overflow-hidden lg:block">
      {STEP_IDS.map((step) => {
        const a = byId.get(step);
        if (!a) return null;
        const info = STATIONS[step];
        const agency = info.agency[mode];
        const isHovered = hovered === step;
        const isActive = activeStep === step;
        const leader = Math.max(0, a.y - CARD_TOP - 132);

        return (
          <div
            key={step}
            className="absolute flex w-[12.5rem] flex-col items-center"
            style={{ left: a.x, top: CARD_TOP, transform: "translateX(-50%)" }}
          >
            <div
              className={cn(
                "pointer-events-auto w-full border bg-studio p-3 rounded-sharp transition-colors duration-150",
                isHovered
                  ? "border-2 border-crimson bg-tint"
                  : isActive
                    ? "border-2 border-crimson"
                    : "border-border",
              )}
              onDragOver={(e) => {
                // Without preventDefault the drop event never fires at all.
                e.preventDefault();
                e.dataTransfer.dropEffect = "copy";
                if (!isHovered) onHover(step);
              }}
              onDragLeave={() => onHover(null)}
              onDrop={(e) => {
                e.preventDefault();
                const raw = e.dataTransfer.getData(DND_TYPE);
                const sp = Number(raw) as StoryPoint;
                if (raw && !Number.isNaN(sp)) onDrop(step, sp);
              }}
            >
              <div className="flex items-baseline justify-between gap-2">
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
                  className="pointer-events-auto mt-2 w-full border border-crimson px-2 py-1 type-caption text-crimson rounded-sharp transition-colors duration-150 hover:bg-tint"
                >
                  Enter {armed} SP here
                </button>
              ) : null}
            </div>

            {/* Leader down to the station it describes. */}
            <span
              aria-hidden
              className={cn(
                "block w-px",
                isHovered || isActive ? "bg-crimson" : "bg-border",
              )}
              style={{ height: leader }}
            />
          </div>
        );
      })}

      {/*
        The same four positions in both rooms. One says what the item is
        waiting for and how deep the pile is; the other says there is nothing
        to wait for. Leaving the AI side blank made the difference invisible,
        which was the whole complaint.
      */}
      {GAP_REASON.map((reason, i) => {
        const a = byId.get(`gap-${i}`);
        if (!a) return null;
        const depth = queueDepths[i] ?? 0;
        const waitingHere =
          mode === "traditional" &&
          activePhase === "wait" &&
          activeStep === STEP_IDS[i + 1];

        if (mode === "ai-driven") {
          return (
            <div
              key={i}
              className="absolute flex w-[10.5rem] flex-col items-center"
              style={{
                left: a.x,
                top: queueBaseline,
                transform: "translateX(-50%)",
              }}
            >
              <div className="w-full border border-border bg-studio px-3 py-2 rounded-sharp">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="type-caption">No queue</span>
                  <span className="type-caption tnum text-charcoal">0</span>
                </div>
                <p className="mt-0.5 type-caption">
                  Nothing waits here. Work carries straight on.
                </p>
              </div>
            </div>
          );
        }

        return (
          <div
            key={i}
            className="absolute flex w-[10.5rem] flex-col items-center"
            style={{
              left: a.x,
              top: queueBaseline,
              transform: "translateX(-50%)",
            }}
          >
            <div
              className={cn(
                "w-full border bg-studio px-3 py-2 rounded-sharp",
                waitingHere
                  ? "border-2 border-crimson bg-tint"
                  : "border-border",
              )}
            >
              <div className="flex items-baseline justify-between gap-2">
                <span className="type-caption">Queue</span>
                <span className="type-caption tnum text-charcoal">{depth}</span>
              </div>
              <p className="mt-0.5 type-caption">{reason}</p>
              {waitingHere ? (
                <p className="mt-1 type-caption tnum text-crimson">
                  Waiting {activeWaitElapsedDays.toFixed(1)} of{" "}
                  {activeWaitDays.toFixed(1)} d
                </p>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
