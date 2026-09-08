"use client";

import { formatDecimal } from "@/lib/localeFormat";
import type { ProcessMode, StoryPoint } from "@/types/process-scene";
import { buildSchedule } from "../model/processModel";
import { useLocale, useT } from "../../shell/LocaleProvider";

/**
 * The two flows, to scale, from the model.
 *
 * This section used to be two illustrations: five little people at five desks
 * with pink boxes stacked beside them, and a conveyor belt. They were drawn to
 * whatever size the picture wanted, which meant the one claim the section
 * exists to make — that the same work takes fourteen times longer on one side
 * — was carried by a caption rather than by the artwork. A reader could not
 * check it, and a reader who did not read the caption learnt nothing.
 *
 * Both bars are drawn against the same `scaleDays`, so the length difference IS
 * the finding. Waiting takes `mist`, which is the token for inert fill and a
 * progress track; work takes charcoal. Neither takes the accent — the screen
 * argues for the flow with no queue in it, not for the queue.
 */
export function FlowLadder({
  mode,
  sp,
  scaleDays,
  titleKey,
  blurbKey,
  footKey,
}: {
  mode: ProcessMode;
  sp: StoryPoint;
  /** Shared between the two ladders, or they are two charts rather than one. */
  scaleDays: number;
  titleKey: string;
  blurbKey: string;
  footKey: string;
}) {
  const t = useT();
  const { locale } = useLocale();
  const s = buildSchedule(mode, sp);
  const d = (n: number) => formatDecimal(n, locale, 1);

  /*
   * Wait then work, per step, in the order they actually occur.
   *
   * Sub-pixel segments are dropped rather than clamped to a minimum width: a
   * 0.06-day checkpoint rendered at a visible 3px would overstate itself by
   * two orders of magnitude, in a diagram whose entire argument is proportion.
   */
  const segments = s.perStep.flatMap((step) => [
    { key: `${step.stepId}-wait`, days: step.waitDays, work: false },
    { key: `${step.stepId}-work`, days: step.workDays, work: true },
  ]);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h3 className="type-section">{t(titleKey)}</h3>
        <p className="mt-1 type-caption">{t(blurbKey)}</p>
      </div>

      <div className="flex flex-wrap items-baseline gap-x-6 gap-y-1">
        <span className="type-page tnum">
          {t("process.ladder.total", { days: d(s.totalDays) })}
        </span>
        <span className="type-caption tnum">
          {t("process.ladder.efficiency", {
            pct: Math.round(s.flowEfficiency * 100),
          })}
        </span>
      </div>

      <div
        role="img"
        aria-label={t("process.ladder.aria", {
          mode: t(titleKey),
          work: d(s.touchDays),
          wait: d(s.waitDays),
          total: d(s.totalDays),
        })}
        className="flex h-8 w-full overflow-hidden border border-border bg-canvas rounded-sharp"
      >
        {segments
          .filter((seg) => seg.days / scaleDays > 0.002)
          .map((seg) => (
            <span
              key={seg.key}
              className={seg.work ? "bg-charcoal" : "bg-mist"}
              style={{ width: `${(seg.days / scaleDays) * 100}%` }}
            />
          ))}
      </div>

      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-border text-left">
            <th scope="col" className="py-2 type-caption">
              {t("process.ladder.step")}
            </th>
            <th scope="col" className="py-2 text-right type-caption">
              {t("process.ladder.workCol")}
            </th>
            <th scope="col" className="py-2 text-right type-caption">
              {t("process.ladder.waitCol")}
            </th>
          </tr>
        </thead>
        <tbody>
          {s.perStep.map((step) => (
            <tr key={step.stepId} className="border-b border-border last:border-b-0">
              <th scope="row" className="py-2 text-left type-caption text-charcoal">
                {t(`sim.step.${step.stepId}`)}
              </th>
              <td className="py-2 text-right type-caption tnum text-charcoal">
                {d(step.workDays)}
              </td>
              <td className="py-2 text-right type-caption tnum text-charcoal">
                {step.waitDays === 0
                  ? t("process.ladder.none")
                  : d(step.waitDays)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="mt-auto type-caption">{t(footKey)}</p>
    </div>
  );
}
