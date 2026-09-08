"use client";

import { CONTAINERS, PORTS } from "@/lib/pricing";
import { sailingDate, type Sailing } from "@/lib/sailings";
import type { ContainerType, PortCode } from "@/types/quote";

export function RouteDetails({
  sailing,
  pol,
  pod,
  containerType,
  units,
}: {
  sailing: Sailing;
  pol: PortCode;
  pod: PortCode;
  containerType: ContainerType;
  units: number;
}) {
  return (
    <section className="border border-border bg-studio p-6 rounded-card shadow-card sm:p-8">
      <h2 className="type-section">Route details</h2>

      <div className="mt-7 grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,17rem)]">
        <div>
          <div className="relative flex items-center">
            <span aria-hidden className="h-0.5 flex-1 bg-charcoal" />
            <span className="px-4 type-caption tnum whitespace-nowrap">
              {sailing.transitDays} days · {sailing.via ? "1 stop" : "Direct"}
            </span>
            <span aria-hidden className="h-0.5 flex-1 bg-charcoal" />
          </div>

          <div className="mt-1 flex items-start justify-between gap-6">
            <span className="flex flex-col gap-1">
              <span
                aria-hidden
                className="mb-2 block h-3 w-3 bg-crimson rounded-full"
              />
              <span className="type-label">{PORTS[pol].city}</span>
              <span className="type-caption tnum">
                {sailingDate(sailing.departsInDays)}
              </span>
            </span>
            <span className="flex flex-col items-end gap-1">
              <span
                aria-hidden
                className="mb-2 block h-3 w-3 bg-crimson rounded-full"
              />
              <span className="type-label">{PORTS[pod].city}</span>
              <span className="type-caption tnum">
                {sailingDate(sailing.departsInDays + sailing.transitDays)}
              </span>
            </span>
          </div>
        </div>

        <dl className="flex flex-col border-l border-border pl-8">
          {[
            ["Vessel", sailing.vessel],
            ["Service", sailing.service],
            ["Container", `${CONTAINERS[containerType].label} × ${units}`],
            ["Routing", sailing.via ? `via ${sailing.via}` : "Direct"],
          ].map(([term, value]) => (
            <div key={term} className="flex flex-col gap-0.5 py-2.5">
              <dt className="type-caption">{term}</dt>
              <dd className="type-label">{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
