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
import { useT } from "../shell/LocaleProvider";

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

/**
 * Every field says what it decides.
 *
 * Four labelled selects in a row is a form that looks finished and teaches
 * nothing: a reader who does not already know that container choice carries a
 * freight multiplier has no way to find out from the control. The hint is the
 * cheapest place to put that, and it is where an operator would expect it.
 */
function Field({
  label,
  hint,
  children,
  className = "",
}: {
  label: string;
  hint: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`flex flex-col gap-2 ${className}`}>
      <span className="type-caption text-charcoal">{label}</span>
      {children}
      <span className="type-caption">{hint}</span>
    </label>
  );
}

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
  const set = <K extends keyof SearchState>(k: K, v: SearchState[K]) =>
    onChange({ ...value, [k]: v });

  /*
   * The box count, shown while the volume is being typed.
   *
   * It is the one derivation on this form that is not obvious from the inputs
   * — 90 CBM is three 20' boxes and 91 is four — and it is the number the
   * whole invoice is built on. Guarded rather than assumed: an out-of-range
   * volume has an error message and should not also print a box count.
   */
  const cbm = Number(value.cbm);
  const units =
    value.cbm === "" || Number.isNaN(cbm) || cbm <= 0 || cbm > MAX_CBM
      ? null
      : Math.max(1, Math.ceil(cbm / CONTAINERS[value.containerType].capacityCbm));

  return (
    <section className="border border-border bg-studio p-6 rounded-card shadow-card sm:p-8">
      <div className="flex gap-7 border-b border-border">
        <span className="relative pb-3 type-label text-crimson-ink">
          {t("business.search.portToPort")}
          <span
            aria-hidden
            className="absolute inset-x-0 bottom-0 h-0.5 bg-crimson"
          />
        </span>
        <span className="pb-3 type-label text-muted">
          {t("business.search.multimodal")}{" "}
          <span className="type-caption">{t("business.search.notBuilt")}</span>
        </span>
      </div>

      <div className="mt-7 grid gap-x-5 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
        <Field
          label={t("business.search.from")}
          hint={t("business.search.hint.pol")}
        >
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
        </Field>

        <Field
          label={t("business.search.to")}
          hint={t("business.search.hint.pod")}
        >
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
        </Field>

        <Field
          label={t("business.search.container")}
          hint={t("business.search.hint.container")}
        >
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
        </Field>

        <Field
          label={t("business.search.tier")}
          hint={t("business.search.hint.tier")}
        >
          <select
            className={FIELD}
            value={value.tier}
            onChange={(e) => set("tier", e.target.value as LoyaltyTier)}
          >
            {TIER_ORDER.map((tier) => (
              <option key={tier} value={tier}>
                {LOYALTY_TIERS[tier].label}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="mt-6 flex flex-wrap items-start gap-5 border-t border-border pt-6">
        <Field
          className="w-64"
          label={t("business.search.volume")}
          hint={
            units === null
              ? t("business.search.hint.volume", { max: MAX_CBM })
              : t("business.search.derived", {
                  cbm: value.cbm,
                  units,
                  container: CONTAINERS[value.containerType].label,
                })
          }
        >
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
        </Field>

        {/* Disabled, not merely inert. The handler already refused to run on
            an invalid form, but the button kept its fill and its hover, so the
            primary action swallowed the click with no feedback at all. */}
        <button
          type="button"
          onClick={onSearch}
          disabled={error !== null}
          className="mt-7 ml-auto inline-flex items-center gap-3 border border-crimson bg-crimson px-7 py-3 type-label text-studio rounded-card transition-colors duration-150 hover:border-charcoal hover:bg-charcoal disabled:cursor-not-allowed disabled:border-border disabled:bg-mist disabled:text-muted"
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
          className="mt-5 border-l-2 border-crimson bg-tint px-4 py-3 type-label text-crimson-ink"
        >
          {error}
        </p>
      ) : null}
    </section>
  );
}
