"use client";

import { CONTAINERS, PORTS } from "@/lib/pricing";
import {
  cutOffsFor,
  legsFor,
  sailingDate,
  sailingWeekday,
  voyageOf,
  type Sailing,
} from "@/lib/sailings";
import type { ContainerType, PortCode } from "@/types/quote";

/**
 * A route panel that shows only ETD and ETA is missing the part that binds a
 * shipper's week. Miss the documentation cut-off and the booking rolls to the
 * next sailing however much transit time was left, so the cut-offs sit beside
 * the departure rather than in a footnote — and a transhipment sailing shows
 * its legs, because "15 days, 1 stop" does not say where the time goes.
 */
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
  const legs = legsFor(sailing, PORTS[pol].city, PORTS[pod].city);
  const cutOffs = cutOffsFor(sailing);
  const arrival = sailing.departsInDays + sailing.transitDays;

  return (
    <section className="flex flex-col gap-6">
      <h2 className="type-section">Route details</h2>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,20rem)]">
        <div className="border border-border bg-studio p-6 rounded-card shadow-card sm:p-8">
          {/* Departure and arrival, then the legs beneath them. */}
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="flex flex-col gap-1">
              <span className="type-overline text-muted">Departs</span>
              <span className="type-section">{PORTS[pol].city}</span>
              <span className="type-label tnum">
                {sailingDate(sailing.departsInDays)}
              </span>
              <span className="type-caption tnum">
                {sailingWeekday(sailing.departsInDays)} · {pol}
              </span>
            </div>

            <div className="flex min-w-[9rem] flex-1 flex-col items-center gap-2 pt-6">
              <span className="type-caption tnum whitespace-nowrap">
                {sailing.transitDays} days ·{" "}
                {sailing.via ? `via ${sailing.via}` : "Direct"}
              </span>
              <span aria-hidden className="flex w-full items-center">
                <span className="h-2 w-2 shrink-0 bg-charcoal rounded-full" />
                <span className="h-px flex-1 bg-charcoal" />
                {sailing.via ? (
                  <>
                    <span className="h-2 w-2 shrink-0 border border-charcoal bg-studio rounded-full" />
                    <span className="h-px flex-1 bg-charcoal" />
                  </>
                ) : null}
                <span className="h-2 w-2 shrink-0 bg-charcoal rounded-full" />
              </span>
            </div>

            <div className="flex flex-col items-end gap-1 text-right">
              <span className="type-overline text-muted">Arrives</span>
              <span className="type-section">{PORTS[pod].city}</span>
              <span className="type-label tnum">{sailingDate(arrival)}</span>
              <span className="type-caption tnum">
                {sailingWeekday(arrival)} · {pod}
              </span>
            </div>
          </div>

          {/* "15 days, 1 stop" does not say where the time goes. */}
          <ol className="mt-8 flex flex-col gap-3 border-t border-border pt-6">
            {legs.map((leg, i) => (
              <li
                key={`${leg.from}-${leg.to}`}
                className="flex items-baseline justify-between gap-6"
              >
                <span className="type-body">
                  <span className="type-caption tnum">
                    Leg {i + 1}
                  </span>{" "}
                  {leg.from} → {leg.to}
                </span>
                <span className="type-label tnum">{leg.days} days</span>
              </li>
            ))}
          </ol>

          <dl className="mt-8 grid gap-x-8 gap-y-4 border-t border-border pt-6 sm:grid-cols-2">
            {[
              ["Vessel", sailing.vessel],
              ["Voyage", voyageOf(sailing)],
              ["Service", sailing.service],
              ["Container", `${CONTAINERS[containerType].label} × ${units}`],
            ].map(([term, value]) => (
              <div key={term} className="flex flex-col gap-0.5">
                <dt className="type-caption">{term}</dt>
                <dd className="type-label">{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <aside className="flex flex-col gap-4 border border-border bg-studio p-6 rounded-card shadow-card">
          <h3 className="type-label">Cut-offs</h3>
          <p className="type-caption">
            Counted back from departure. Miss one and the booking rolls to the
            next sailing, whatever the transit time says.
          </p>
          <dl className="flex flex-col">
            {cutOffs.map((cut) => (
              <div
                key={cut.label}
                className="flex flex-col gap-1 border-b border-border py-3 last:border-b-0"
              >
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="type-label">{cut.label}</dt>
                  <dd className="type-label tnum">
                    {sailingDate(cut.offsetDays)}
                  </dd>
                </div>
                <p className="type-caption">{cut.detail}</p>
              </div>
            ))}
          </dl>
        </aside>
      </div>
    </section>
  );
}
