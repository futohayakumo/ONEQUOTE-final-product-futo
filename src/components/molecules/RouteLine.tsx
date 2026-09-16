"use client";

import { HUB_COUNTRY, Flag } from "../atoms/Flag";
import { portName } from "@/lib/ports";
import type { PortCode } from "@/types/quote";
import { useT } from "../providers/LocaleProvider";

/**
 * The voyage as a line between two dots, with a dot for every call in between.
 *
 * It replaces an arrow glyph, which said only "left to right". A transhipment
 * is the single fact that most changes what a sailing is worth — it is why one
 * option here is $426 cheaper and three days longer — and an arrow cannot show
 * one. A line can: the stops sit ON it, spaced evenly, so one call lands at the
 * midpoint and two at the thirds without anything being told where to go.
 *
 * Above the line, what the routing is. Below it, and larger, how long it takes:
 * that is the number a reader is actually comparing across three rows.
 */
export function RouteLine({
  pol,
  pod,
  via,
  transitDays,
}: {
  pol: PortCode;
  pod: PortCode;
  /** One hub today; the geometry holds for any number. */
  via: string | null;
  transitDays: number;
}) {
  const t = useT();
  const stops = via ? [via] : [];

  return (
    <span className="flex min-w-[11rem] flex-1 flex-col items-center gap-1.5">
      <span className="type-caption">
        {stops.length === 0
          ? t("sail.route.direct")
          : t("sail.route.stops", { n: stops.length })}
      </span>

      <span className="relative flex w-full items-center py-1">
        <span aria-hidden className="h-px w-full bg-control" />

        {/* The two ends and every call between them, positioned as a fraction
            of the run so the spacing follows from the count. */}
        {[0, ...stops.map((_, i) => (i + 1) / (stops.length + 1)), 1].map(
          (at, i) => (
            <span
              key={i}
              aria-hidden
              className={
                at === 0 || at === 1
                  ? "absolute h-2 w-2 -translate-x-1/2 bg-charcoal rounded-full"
                  : "absolute h-2 w-2 -translate-x-1/2 border border-charcoal bg-studio rounded-full"
              }
              style={{ left: `${at * 100}%` }}
            />
          ),
        )}
      </span>

      <span className="type-label tnum">
        {t("sail.route.days", { days: transitDays })}
      </span>

      {via ? (
        <span className="flex items-center gap-1 type-caption">
          <Flag country={HUB_COUNTRY[via] ?? ""} />
          {via}
        </span>
      ) : null}

      <span className="sr-only">
        {portName(pol)} → {portName(pod)}
      </span>
    </span>
  );
}
