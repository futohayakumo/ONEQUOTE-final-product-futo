"use client";

import { NODES, STAGES } from "@/lib/flow-data";
import type { Trace } from "@/lib/trace";
import type { NodeId } from "@/types/flow";
import { useT } from "../shell/LocaleProvider";

/**
 * The horizontal timeline under the map. It reads the live route, so
 * re-routing the diagram re-times it — a fixed timeline under a diagram that
 * changes would say the same thing about two different paths.
 */
const STAGE_TITLE: Record<string, string> = Object.fromEntries(
  STAGES.map((s) => [s.id, s.titleKey]),
);

export function RequestTrace({ trace }: { trace: Trace }) {
  const t = useT();
  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <h2 className="type-section">{t("eng.trace.title")}</h2>
          <p className="mt-1 type-caption">
            {t("eng.trace.lede")}
          </p>
        </div>
        <p className="type-caption tnum">
          <span className="type-label">{trace.totalMs} ms</span>{" "}
          {t("eng.trace.total")}
        </p>
      </div>

      <ol className="relative flex flex-col gap-6 sm:flex-row sm:gap-0">
        {/* One rule behind the whole row, so the dots sit ON a line rather than
            each carrying their own connector stub. */}
        <span
          aria-hidden
          className="absolute top-1.5 right-4 left-4 hidden h-px bg-border sm:block"
        />
        {trace.hops.map((hop, i) => (
          <li
            key={hop.id}
            className="relative flex flex-1 flex-col gap-2 sm:items-start"
          >
            <span
              aria-hidden
              className={
                i === 0
                  ? "relative z-10 h-3 w-3 border-2 border-crimson bg-studio rounded-full"
                  : "relative z-10 h-3 w-3 bg-charcoal rounded-full"
              }
            />
            <span className="type-caption tnum text-muted">{hop.hop}</span>
            {/* The layer, so the timeline shows the request crossing tiers
                rather than five equivalent stops on one line. */}
            <span className="type-overline text-muted">
              {t(STAGE_TITLE[NODES[hop.id as NodeId]?.stage] ?? "")}
            </span>
            <span className="pr-4 type-label">
              {NODES[hop.id as NodeId]?.label ?? hop.label}
            </span>
            {/* Timings alone say how long each stop took and nothing about what
                any of them did. This is the state change. */}
            <span className="pr-4 type-caption">
              {t(`node.${hop.id}.io`)}
            </span>
            <span className="type-caption tnum">{hop.at}</span>
            <span className="type-caption tnum">{hop.ms} ms</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
