"use client";

import {
  COMMODITIES,
  COMMODITY_ORDER,
  EQUIPMENT,
  EQUIPMENT_ORDER,
  LOYALTY_TIERS,
  MAX_QUANTITY_PER_ROW,
  MAX_ROWS,
  SCOPE_ORDER,
  TIER_ORDER,
  emptyRow,
  laneDistanceNm,
} from "@/lib/pricing";
import { formatDate, formatDecimal } from "@/lib/localeFormat";
import { PORTS_META, transitDaysFromNm } from "@/lib/ports";
import type {
  Commodity,
  ContainerRow,
  EquipmentType,
  LoyaltyTier,
  QuoteInput,
  Scope,
} from "@/types/quote";
import { ArrowRight } from "../../atoms/icons/ArrowRight";
import { DepartureCalendar } from "../../molecules/DepartureCalendar";
import { PortField } from "../../molecules/PortField";
import { useLocale, useT } from "../../providers/LocaleProvider";

/**
 * Page one of the real product, as observed on 2026-09-11: origin,
 * destination, a container section of equipment × quantity × weight that
 * grows a row at a time, a commodity, and a departure date picked from a
 * calendar on which only sailing days are selectable and each carries a
 * price. Two fields the product does not show are here on purpose: the
 * loyalty tier, because this site has no accounts to take it from, and the
 * scope at each end, because it decides which charges exist.
 */

const FIELD =
  "w-full border border-control bg-studio px-4 py-3 type-label rounded-card";
const SMALL =
  "w-full border border-control bg-studio px-3 py-2.5 type-label tnum rounded-card";

export type SearchState = QuoteInput;

export function SearchPanel({
  value,
  error,
  onChange,
  onSearch,
  priceForDay,
}: {
  value: SearchState;
  error: string | null;
  onChange: (next: SearchState) => void;
  onSearch: () => void;
  /** The cheapest all-in for a departure day, for the calendar's chips. */
  priceForDay: (etdOffset: number) => number | null;
}) {
  const t = useT();
  const { locale } = useLocale();
  const set = <K extends keyof SearchState>(k: K, v: SearchState[K]) =>
    onChange({ ...value, [k]: v });

  const setRow = (i: number, patch: Partial<ContainerRow>) =>
    set(
      "containers",
      value.containers.map((r, j) => (j === i ? { ...r, ...patch } : r)),
    );
  const removeRow = (i: number) =>
    set(
      "containers",
      value.containers.filter((_, j) => j !== i),
    );
  const addRow = () => {
    if (value.containers.length >= MAX_ROWS) return;
    // The next row starts on the first equipment type this row has not
    // used, so "add a row" reads as "add another kind", which is what it is.
    const used = new Set(value.containers.map((r) => r.equipment));
    const next = EQUIPMENT_ORDER.find((e) => !used.has(e)) ?? "DRY20";
    set("containers", [...value.containers, emptyRow(next)]);
  };

  const distanceNm = value.pol && value.pod ? laneDistanceNm(value.pol, value.pod) : 0;

  const portSelect = (key: "pol" | "pod", labelKey: string) => (
    <PortField
      label={t(labelKey)}
      value={value[key]}
      onChange={(code) => set(key, code)}
      className={FIELD}
    />
  );

  return (
    <section className="border border-border bg-studio p-6 rounded-card shadow-card sm:p-8">
      <p className="border-b border-border pb-3 type-overline text-muted">
        {t("business.search.portToPort")}
      </p>

      {/* ── Route ──────────────────────────────────────────── */}
      <div className="mt-7 grid gap-5 sm:grid-cols-2">
        {portSelect("pol", "business.search.from")}
        {portSelect("pod", "business.search.to")}
      </div>
      {/* Where the ports come from, and how many the list could not place:
          the one line on the form that is real data rather than a model. */}
      <p className="mt-3 max-w-[70ch] type-caption">
        {t("business.search.portsNote", {
          placed: formatDecimal(PORTS_META.withCoordinates, locale, 0),
          total: formatDecimal(PORTS_META.seaports, locale, 0),
          date: formatDate(Date.parse(PORTS_META.fetchedAt), locale),
        })}
        {distanceNm > 0
          ? " " +
            t("business.search.distance", {
              nm: formatDecimal(distanceNm, locale, 0),
              days: transitDaysFromNm(distanceNm),
            })
          : ""}
      </p>

      {/* ── Scope ──────────────────────────────────────────── */}
      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        {(["originScope", "destinationScope"] as const).map((key) => (
          <label key={key} className="flex flex-col gap-2">
            <span className="type-caption">{t(`business.search.${key}`)}</span>
            <select
              className={FIELD}
              value={value[key]}
              onChange={(e) => set(key, e.target.value as Scope)}
            >
              {SCOPE_ORDER.map((s) => (
                <option key={s} value={s}>
                  {t(`scope.${s}`)}
                </option>
              ))}
            </select>
          </label>
        ))}
      </div>

      {/* ── Containers ──────────────────────────────────────── */}
      <div className="mt-8">
        <div className="flex items-baseline justify-between gap-4">
          <span className="type-caption">{t("business.search.containers")}</span>
          <span className="type-caption tnum">
            {t("business.search.rowCount", {
              n: value.containers.length,
              max: MAX_ROWS,
            })}
          </span>
        </div>
        <ol className="mt-2 flex flex-col gap-3">
          {value.containers.map((row, i) => {
            const eq = EQUIPMENT[row.equipment];
            const perBox = row.quantity > 0 ? row.weightKg / row.quantity : 0;
            const over = perBox > eq.overweightFromKg;
            return (
              <li
                key={i}
                className="grid items-end gap-3 border border-border p-4 rounded-card sm:grid-cols-[minmax(0,1.6fr)_minmax(0,0.7fr)_minmax(0,1fr)_auto]"
              >
                <label className="flex flex-col gap-1.5">
                  <span className="type-caption">{t("business.search.equipment")}</span>
                  <select
                    className={SMALL}
                    value={row.equipment}
                    onChange={(e) =>
                      setRow(i, { equipment: e.target.value as EquipmentType })
                    }
                  >
                    {EQUIPMENT_ORDER.map((e) => (
                      <option key={e} value={e}>
                        {EQUIPMENT[e].label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="type-caption">{t("business.search.quantity")}</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    min={1}
                    max={MAX_QUANTITY_PER_ROW}
                    className={SMALL}
                    value={row.quantity}
                    onChange={(e) => setRow(i, { quantity: Number(e.target.value) })}
                  />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="type-caption">
                    {t("business.search.weight")}
                    {/* The per-box figure is the one the tariff cares about,
                        and the one a customer typing a total cannot see. */}
                    <span className={`ml-2 tnum ${over ? "text-crimson" : ""}`}>
                      {t("business.search.perBox", {
                        kg: formatDecimal(Math.round(perBox), locale, 0),
                      })}
                    </span>
                  </span>
                  <input
                    type="number"
                    inputMode="numeric"
                    min={1}
                    step={100}
                    className={SMALL}
                    value={row.weightKg}
                    onChange={(e) => setRow(i, { weightKg: Number(e.target.value) })}
                  />
                </label>
                <button
                  type="button"
                  onClick={() => removeRow(i)}
                  disabled={value.containers.length === 1}
                  aria-label={t("business.search.removeRow")}
                  className="h-11 w-11 border border-control bg-studio type-label text-muted rounded-card transition-colors duration-150 hover:border-charcoal hover:text-charcoal disabled:opacity-40"
                >
                  ×
                </button>
              </li>
            );
          })}
        </ol>
        {value.containers.length < MAX_ROWS ? (
          <button
            type="button"
            onClick={addRow}
            className="mt-3 inline-flex items-center gap-2 border border-control bg-studio px-4 py-2 type-caption text-charcoal rounded-card transition-colors duration-150 hover:border-charcoal"
          >
            + {t("business.search.addRow")}
          </button>
        ) : null}
      </div>

      {/* ── Commodity and tier ──────────────────────────────── */}
      <div className="mt-7 grid gap-5 sm:grid-cols-2">
        <label className="flex flex-col gap-2">
          <span className="type-caption">{t("business.search.commodity")}</span>
          <select
            className={FIELD}
            value={value.commodity}
            onChange={(e) => set("commodity", e.target.value as Commodity)}
          >
            {COMMODITY_ORDER.map((c) => (
              <option key={c} value={c}>
                {t(COMMODITIES[c].labelKey)}
                {COMMODITIES[c].requiresReefer ? ` — ${t("commodity.reeferOnly")}` : ""}
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
                  discount: formatDecimal(LOYALTY_TIERS[id].discountRate * 100, locale, 0),
                  teu: LOYALTY_TIERS[id].milestoneTeu,
                })}
              </option>
            ))}
          </select>
          <span className="type-caption">{t("business.search.tierNoAccount")}</span>
        </label>
      </div>

      {/* ── Departure ───────────────────────────────────────── */}
      <div className="mt-8">
        <span className="type-caption">{t("business.search.departure")}</span>
        <p className="mt-1 type-caption">{t("business.search.departureNote")}</p>
        <div className="mt-3">
          {value.pol && value.pod && value.pol !== value.pod ? (
            <DepartureCalendar
              pol={value.pol}
              pod={value.pod}
              selected={value.etdOffset}
              onSelect={(d) => set("etdOffset", d)}
              priceForDay={priceForDay}
            />
          ) : null}
        </div>
      </div>

      <div className="mt-7 flex flex-wrap items-center justify-between gap-5">
        <p className="type-caption text-crimson" role="alert">
          {error ?? ""}
        </p>
        <button
          type="button"
          onClick={onSearch}
          disabled={!!error}
          className="inline-flex items-center gap-3 border border-crimson bg-crimson px-6 py-3 type-label text-studio rounded-card transition-colors duration-150 hover:border-charcoal hover:bg-charcoal disabled:cursor-not-allowed disabled:opacity-50"
        >
          {t("business.search.submit")}
          <ArrowRight size={18} />
        </button>
      </div>
    </section>
  );
}
