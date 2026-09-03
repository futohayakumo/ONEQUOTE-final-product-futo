"use client";

import type { StepId, StoryPoint } from "@/types/process-scene";
import { STEP_LABEL, compare } from "./model/processModel";
import { SectionTitle } from "../ui/SectionTitle";

export interface RunRow {
  itemId: string;
  sp: StoryPoint;
  startStep: StepId;
}

/**
 * The cycle-time comparison. Both modes are always shown, computed from the
 * same model — so dropping one box answers the actual question even though
 * only one room is rendered in 3D at a time.
 *
 * This is a real <table>, not canvas text: the numbers must never live only
 * inside the renderer.
 */
export function RunReadout({ runs }: { runs: RunRow[] }) {
  if (runs.length === 0) {
    return (
      <div className="flex flex-col gap-2 border border-border bg-studio p-6 rounded-sharp">
        <SectionTitle as="h3">Cycle time</SectionTitle>
        <p className="type-caption">
          Drop a story point box onto a step, or select one and press Enter, to
          see how long the same work takes under each approach.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 border border-border bg-studio p-6 rounded-sharp">
      <SectionTitle as="h3">Cycle time</SectionTitle>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[36rem] border-collapse">
          <caption className="sr-only">
            Simulated cycle time in days for each dropped work item under both
            delivery approaches.
          </caption>
          <thead>
            <tr className="border-b border-border">
              <th scope="col" className="py-2 pr-4 text-left type-caption">
                Item
              </th>
              <th scope="col" className="py-2 pr-4 text-left type-caption">
                Entered at
              </th>
              <th scope="col" className="py-2 pr-4 text-right type-caption">
                Traditional Agile
              </th>
              <th scope="col" className="py-2 pr-4 text-right type-caption">
                AI-Driven Delivery
              </th>
              <th scope="col" className="py-2 text-right type-caption">
                Faster by
              </th>
            </tr>
          </thead>
          <tbody>
            {runs.map((run) => {
              const c = compare(run.sp, run.startStep);
              return (
                <tr key={run.itemId} className="border-b border-border last:border-b-0">
                  <th scope="row" className="py-3 pr-4 text-left type-label tnum">
                    {run.sp} SP
                  </th>
                  <td className="py-3 pr-4 type-caption">
                    {STEP_LABEL[run.startStep]}
                  </td>
                  <td className="py-3 pr-4 text-right type-body tnum">
                    {c.traditional.totalDays.toFixed(1)} d
                    <span className="ml-2 type-caption">
                      ({c.traditional.waitDays.toFixed(1)} waiting)
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-right type-body tnum">
                    {c.aiDriven.totalDays.toFixed(1)} d
                    <span className="ml-2 type-caption">(0.0 waiting)</span>
                  </td>
                  <td className="py-3 text-right type-label tnum text-crimson">
                    {c.ratio.toFixed(1)}&times;
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="type-caption">
        Flow efficiency under Traditional Agile is the share of elapsed time
        that is actual work. It falls as batch size grows, because queue wait is
        superlinear in story points while hands-on effort is linear.
      </p>
    </div>
  );
}
