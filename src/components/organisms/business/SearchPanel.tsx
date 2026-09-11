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
import { ArrowRight } from "../../atoms/icons/ArrowRight";
import { Flag } from "../../atoms/Flag";
import { formatDecimal } from "@/lib/localeFormat";
import { useLocale, useT } from "../../providers/LocaleProvider";

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
  const t = useT();
  const { locale } = useLocale();
  const set = <K extends keyof SearchState>(k: K, v: SearchState[K]) =>
    onChange({ ...value, [k]: v });

  return (
    <section className="border border-border bg-studio p-6 rounded-card shadow-card sm:p-8">
      {/* One mode, so it is a heading and not a tab. The second tab said
          "(not built)" beside it, which both reviewers read as the site
          admitting it was unfinished. */}
      <p className="border-b border-border pb-3 type-overline text-muted">
        {t("business.search.portToPort")}
      </p>

      <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <label className="flex flex-col gap-2">
          <span className="type-caption">{t("business.search.from")}</span>
          {/* A native <option> renders text and nothing else, so the flag
              cannot go inside the list. It sits over the control's left
              padding instead and shows the port that is selected. */}
          <span className="relative">
            <Flag
              country={PORTS[value.pol].country}
              className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2"
            />
            <select
              className={`${FIELD} pl-12`}
              value={value.pol}
              onChange={(e) => set("pol", e.target.value as PortCode)}
            >
              {PORT_ORDER.map((p) => (
                <option key={p} value={p}>
                  {PORTS[p].city} ({p})
                </option>
              ))}
            </select>
          </span>
        </label>

        <label className="flex flex-col gap-2">
          <span className="type-caption">{t("business.search.to")}</span>
          {/* A native <option> renders text and nothing else, so the flag
              cannot go inside the list. It sits over the control's left
              padding instead and shows the port that is selected. */}
          <span className="relative">
            <Flag
              country={PORTS[value.pod].country}
              className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2"
            />
            <select
              className={`${FIELD} pl-12`}
              value={value.pod}
              onChange={(e) => set("pod", e.target.value as PortCode)}
            >
              {PORT_ORDER.map((p) => (
                <option key={p} value={p}>
                  {PORTS[p].city} ({p})
                </option>
              ))}
            </select>
          </span>
        </label>

        <label className="flex flex-col gap-2">
          <span className="type-caption">{t("business.search.container")}</span>
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
          <span className="type-caption">{t("business.search.tier")}</span>
          <select
            className={FIELD}
            value={value.tier}
            onChange={(e) => set("tier", e.target.value as LoyaltyTier)}
          >
            {TIER_ORDER.map((id) => (
              <option key={id} value={id}>
                {LOYALTY_TIERS[id].label} —{" "}
                {t("business.search.tierOption", {
                  discount: formatDecimal(
                    LOYALTY_TIERS[id].discountRate * 100,
                    locale,
                    0,
                  ),
                  teu: LOYALTY_TIERS[id].milestoneTeu,
                })}
              </option>
            ))}
          </select>
          {/* What the chosen tier means, in the two numbers it is made of.
              "Silver Sail" was a name with nothing under it; both reviewers
              asked what it was, and the quiz downstream asks about it. */}
          <span className="type-caption tnum">
            {t("business.search.tierNote", {
              tier: LOYALTY_TIERS[value.tier].label,
              discount: formatDecimal(
                LOYALTY_TIERS[value.tier].discountRate * 100,
                locale,
                0,
              ),
              teu: LOYALTY_TIERS[value.tier].milestoneTeu,
            })}
          </span>
        </label>
      </div>

      <div className="mt-5 flex flex-wrap items-end gap-5">
        <label className="flex w-56 flex-col gap-2">
          <span className="type-caption">{t("business.search.volume")}</span>
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
          {t("business.search.submit")}
          <ArrowRight size={18} />
        </button>
      </div>

      {/* Crimson is this system's "look here" for both active and invalid, so
          an error never depends on the colour alone — it carries a sentence. */}
      {error ? (
        <p
          role="alert"
          className="mt-5 border-l-2 border-crimson bg-tint px-4 py-3 type-label text-crimson"
        >
          {error}
        </p>
      ) : null}
    </section>
  );
}
