"use client";

import {
  MAX_CBM,
  CONTAINERS,
  CONTAINER_ORDER,
  PORTS,
  PORT_ORDER,
  TIER_ORDER,
  LOYALTY_TIERS,
} from "@/lib/pricing";
import type { ContainerType, LoyaltyTier, PortCode } from "@/types/quote";
import { ArrowRight } from "../icons/ArrowRight";

export interface SearchState {
  pol: PortCode;
  pod: PortCode;
  containerType: ContainerType;
  tier: LoyaltyTier;
  /**
   * `number | ""` because a controlled number input needs an empty state.
   * With a bare number, Number("") is 0 and `value` writes it straight back,
   * so clearing the field leaves a 0 the user has to select and overwrite.
   * types/quote.ts already modelled it this way; the newer screen dropped it.
   */
  cbm: number | "";
}

const FIELD =
  "w-full border border-control bg-studio px-4 py-3 type-label rounded-card";

export function SearchPanel({
  value,
  error,
  onChange,
  onSearch,
}: {
  value: SearchState;
  error: string | null;
  onChange: (next: SearchState) => void;
  onSearch: () => void;
}) {
  const set = <K extends keyof SearchState>(k: K, v: SearchState[K]) =>
    onChange({ ...value, [k]: v });

  return (
    <section className="border border-border bg-studio p-6 rounded-card shadow-card sm:p-8">
      <div className="flex gap-7 border-b border-border">
        <span className="relative pb-3 type-label text-crimson-ink">
          Port to port
          <span
            aria-hidden
            className="absolute inset-x-0 bottom-0 h-0.5 bg-crimson"
          />
        </span>
        <span className="pb-3 type-label text-muted">
          Multimodal <span className="type-caption">(not built)</span>
        </span>
      </div>

      <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <label className="flex flex-col gap-2">
          <span className="type-caption">From</span>
          <select
            className={FIELD}
            value={value.pol}
            onChange={(e) => set("pol", e.target.value as PortCode)}
          >
            {PORT_ORDER.map((p) => (
              <option key={p} value={p}>
                {PORTS[p].city} ({p})
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-2">
          <span className="type-caption">To</span>
          <select
            className={FIELD}
            value={value.pod}
            onChange={(e) => set("pod", e.target.value as PortCode)}
          >
            {PORT_ORDER.map((p) => (
              <option key={p} value={p}>
                {PORTS[p].city} ({p})
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-2">
          <span className="type-caption">Container</span>
          <select
            className={FIELD}
            value={value.containerType}
            onChange={(e) =>
              set("containerType", e.target.value as ContainerType)
            }
          >
            {CONTAINER_ORDER.map((c) => (
              <option key={c} value={c}>
                {CONTAINERS[c].label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-2">
          <span className="type-caption">Loyalty tier</span>
          <select
            className={FIELD}
            value={value.tier}
            onChange={(e) => set("tier", e.target.value as LoyaltyTier)}
          >
            {TIER_ORDER.map((t) => (
              <option key={t} value={t}>
                {LOYALTY_TIERS[t].label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-5 flex flex-wrap items-end gap-5">
        <label className="flex w-56 flex-col gap-2">
          <span className="type-caption">Volume (CBM)</span>
          <input
            type="number"
            inputMode="numeric"
            min={1}
            max={MAX_CBM}
            className={`${FIELD} tnum`}
            value={value.cbm}
            onChange={(e) =>
              set("cbm", e.target.value === "" ? "" : Number(e.target.value))
            }
          />
        </label>

        {/* Disabled, not merely inert. The handler already refused to run on
            an invalid form, but the button kept its fill and its hover, so the
            primary action swallowed the click with no feedback at all. */}
        <button
          type="button"
          onClick={onSearch}
          disabled={error !== null}
          className="ml-auto inline-flex items-center gap-3 border border-crimson bg-crimson px-7 py-3 type-label text-studio rounded-card transition-colors duration-150 hover:border-charcoal hover:bg-charcoal disabled:cursor-not-allowed disabled:border-border disabled:bg-mist disabled:text-muted"
        >
          Search sailings
          <ArrowRight size={18} />
        </button>
      </div>

      {/* Crimson is this system's "look here" for both active and invalid, so
          an error never depends on the colour alone — it carries a sentence. */}
      {error ? (
        <p
          role="alert"
          className="mt-5 border-l-2 border-crimson bg-tint px-4 py-3 type-label text-crimson-ink"
        >
          {error}
        </p>
      ) : null}
    </section>
  );
}
