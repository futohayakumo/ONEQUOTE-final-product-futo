"use client";

import cn from "clsx";
import { usd } from "@/lib/format";
import { PORTS } from "@/lib/pricing";
import { sailingDate, sailingWeekday, type Sailing } from "@/lib/sailings";
import type { PortCode } from "@/types/quote";
import { ArrowRight } from "../icons/ArrowRight";

export function SailingList({
  sailings,
  pol,
  pod,
  selectedId,
  priceFor,
  onSelect,
}: {
  sailings: Sailing[];
  pol: PortCode;
  pod: PortCode;
  selectedId: string;
  priceFor: (s: Sailing) => number;
  onSelect: (id: string) => void;
}) {
  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="type-section">Available sailings</h2>
        <p className="type-caption">
          {sailings.length} options. All rates in USD and include ocean freight,
          terminal handling, documentation and bunker adjustment.
        </p>
      </div>

      <fieldset>
        <legend className="sr-only">Choose a sailing</legend>
        <ul className="flex flex-col gap-4">
          {sailings.map((s) => {
            const active = s.id === selectedId;
            return (
              <li key={s.id}>
                <label
                  className={cn(
                    "ring-on-focus flex cursor-pointer flex-wrap items-center gap-x-8 gap-y-4 px-6 py-5 rounded-card transition-colors duration-150",
                    active
                      ? "border-2 border-crimson bg-tint shadow-raised"
                      : "border border-control bg-studio shadow-card hover:border-crimson",
                  )}
                >
                  <input
                    type="radio"
                    name="sailing"
                    className="sr-only"
                    checked={active}
                    onChange={() => onSelect(s.id)}
                  />
                  <span
                    aria-hidden
                    className={cn(
                      "flex h-5 w-5 shrink-0 items-center justify-center border-2 rounded-full",
                      active ? "border-crimson" : "border-control",
                    )}
                  >
                    {active ? (
                      <span className="h-2.5 w-2.5 bg-crimson rounded-full" />
                    ) : null}
                  </span>

                  <span className="flex min-w-[11rem] flex-col gap-1">
                    {s.recommended ? (
                      <span className="mb-1 self-start bg-tint px-2.5 py-1 type-caption text-crimson-ink rounded-full">
                        Recommended
                      </span>
                    ) : null}
                    <span className="type-label">{s.vessel}</span>
                    <span className="type-caption">
                      {s.via ? `via ${s.via}` : s.service}
                    </span>
                  </span>

                  <span className="flex flex-col gap-1">
                    <span className="type-caption">Departure</span>
                    <span className="type-label tnum">
                      {sailingDate(s.departsInDays)}
                    </span>
                    <span className="type-caption tnum">
                      {sailingWeekday(s.departsInDays)} · {pol}
                    </span>
                  </span>

                  <span aria-hidden className="text-muted">
                    <ArrowRight size={18} />
                  </span>

                  <span className="flex flex-col gap-1">
                    <span className="type-caption">Arrival</span>
                    <span className="type-label tnum">
                      {sailingDate(s.departsInDays + s.transitDays)}
                    </span>
                    <span className="type-caption tnum">
                      {sailingWeekday(s.departsInDays + s.transitDays)} · {pod}
                    </span>
                  </span>

                  <span className="flex flex-col gap-1">
                    <span className="type-caption">Transit</span>
                    <span className="type-label tnum">
                      {s.transitDays} days
                    </span>
                    <span className="type-caption">
                      {s.via ? "1 stop" : "Direct"}
                    </span>
                  </span>

                  <span className="ml-auto flex flex-col items-end gap-1">
                    <span className="type-section tnum">
                      ${usd(priceFor(s))}
                    </span>
                    <span className="type-caption">
                      {PORTS[pol].city} → {PORTS[pod].city}
                    </span>
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
      </fieldset>
    </section>
  );
}
