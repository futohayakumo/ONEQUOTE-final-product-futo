"use client";

import type { StepId, StoryPoint } from "@/types/process-scene";
import { formatDecimal } from "@/lib/localeFormat";
import { compare } from "./model/processModel";
import { useLocale, useT } from "../shell/LocaleProvider";
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
  const t = useT();
  const { locale } = useLocale();

  if (runs.length === 0) {
    return (
      <div className="flex flex-col gap-2 border border-border bg-studio p-6 rounded-sharp">
        <SectionTitle as="h3">{t("sim.readout.title")}</SectionTitle>
        <p className="type-caption">{t("sim.readout.empty")}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 border border-border bg-studio p-6 rounded-sharp">
      <SectionTitle as="h3">{t("sim.readout.title")}</SectionTitle>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[36rem] border-collapse">
          <caption className="sr-only">{t("sim.readout.caption")}</caption>
          <thead>
            <tr className="border-b border-border">
              <th scope="col" className="py-2 pr-4 text-left type-caption">
                {t("sim.readout.item")}
              </th>
              <th scope="col" className="py-2 pr-4 text-left type-caption">
                {t("sim.readout.enteredAt")}
              </th>
              <th scope="col" className="py-2 pr-4 text-right type-caption">
                {t("sim.mode.traditional")}
              </th>
              <th scope="col" className="py-2 pr-4 text-right type-caption">
                {t("sim.mode.ai")}
              </th>
              <th scope="col" className="py-2 text-right type-caption">
                {t("sim.readout.fasterBy")}
              </th>
            </tr>
          </thead>
          <tbody>
            {runs.map((run) => {
              const c = compare(run.sp, run.startStep);
              return (
                <tr
                  key={run.itemId}
                  className="border-b border-border last:border-b-0"
                >
                  <th
                    scope="row"
                    className="py-3 pr-4 text-left type-label tnum"
                  >
                    {t("sim.readout.sp", { sp: run.sp })}
                  </th>
                  <td className="py-3 pr-4 type-caption">
                    {t(`sim.step.${run.startStep}`)}
                  </td>
                  <td className="py-3 pr-4 text-right type-body tnum">
                    {t("sim.readout.days", {
                      days: formatDecimal(c.traditional.totalDays, locale),
                    })}
                    <span className="ml-2 type-caption">
                      {t("sim.readout.waiting", {
                        days: formatDecimal(c.traditional.waitDays, locale),
                      })}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-right type-body tnum">
                    {t("sim.readout.days", {
                      days: formatDecimal(c.aiDriven.totalDays, locale),
                    })}
                    <span className="ml-2 type-caption">
                      {t("sim.readout.waiting", {
                        days: formatDecimal(0, locale),
                      })}
                    </span>
                  </td>
                  <td className="py-3 text-right type-label tnum text-crimson">
                    {t("sim.readout.times", { n: formatDecimal(c.ratio, locale) })}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-2 border-t border-border pt-4">
        <p className="max-w-[86ch] type-caption">{t("sim.readout.note1")}</p>
        <p className="max-w-[86ch] type-caption">{t("sim.readout.note2")}</p>
      </div>
    </div>
  );
}
