"use client";

import cn from "clsx";
import type { ProcessMode, StepId, StoryPoint } from "@/types/process-scene";
import { formatDecimal } from "@/lib/localeFormat";
import { useLocale, useT } from "../shell/LocaleProvider";
import { compare } from "./model/processModel";

/**
 * A running clock over the floor.
 *
 * The cycle-time table states the cost after the fact. This makes it felt
 * while it accrues: in the traditional room the counter keeps climbing while
 * the item sits in a pile doing nothing, and the bar shows how little of that
 * elapsed time was actual work.
 */
export function ElapsedClock({
  mode,
  sp,
  startStep,
  elapsedDays,
  phase,
}: {
  mode: ProcessMode;
  sp: StoryPoint | null;
  /** Entering later in the pipeline shortens the run, so the total depends on it. */
  startStep: StepId;
  elapsedDays: number;
  phase: "work" | "wait" | "transit" | null;
}) {
  const t = useT();
  const { locale } = useLocale();

  if (sp === null) {
    return (
      <div className="flex items-center gap-4 border border-border bg-studio px-5 py-3 rounded-sharp">
        <span className="type-caption">{t("sim.clock.idle")}</span>
      </div>
    );
  }

  const c = compare(sp, startStep);
  const total = mode === "traditional" ? c.traditional : c.aiDriven;
  const pct = Math.min(100, (elapsedDays / total.totalDays) * 100);
  const efficiency = Math.round(total.flowEfficiency * 100);

  return (
    <div className="flex flex-col gap-3 border border-border bg-studio px-5 py-4 rounded-sharp">
      <div className="flex flex-wrap items-baseline gap-x-8 gap-y-2">
        <span className="type-label tnum">
          {t("sim.clock.elapsed", { days: formatDecimal(elapsedDays, locale) })}
        </span>
        <span className="type-caption tnum">
          {t("sim.clock.total", {
            days: formatDecimal(total.totalDays, locale),
          })}
        </span>
        <span
          className={cn(
            "type-caption",
            phase === "wait" ? "text-crimson" : "text-charcoal",
          )}
        >
          {t(
            phase === "wait"
              ? "sim.clock.wait"
              : phase === "work"
                ? "sim.clock.work"
                : phase === "transit"
                  ? "sim.clock.transit"
                  : "sim.clock.done",
          )}
        </span>
        <span className="ml-auto type-caption tnum">
          {t("sim.clock.efficiency", { pct: efficiency })}
        </span>
      </div>

      {/* Squared ends: a 4px radius on a 4px bar renders as a pill. */}
      <div
        className="h-1 w-full border border-border bg-canvas"
        style={{ borderRadius: 0 }}
        role="progressbar"
        aria-valuenow={Math.round(elapsedDays)}
        aria-valuemin={0}
        aria-valuemax={Math.round(total.totalDays)}
        aria-label={t("sim.clock.aria")}
      >
        <div
          className={cn(
            "h-full transition-[width] duration-200 ease-linear",
            phase === "wait" ? "bg-crimson" : "bg-charcoal",
          )}
          style={{ width: `${pct}%`, borderRadius: 0 }}
        />
      </div>
    </div>
  );
}
