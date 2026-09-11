"use client";

import { formatMoney } from "@/lib/localeFormat";
import {
  EXTRA_FREE_TIME_USD_PER_DAY,
  FREE_TIME_INCLUDED_DAYS,
  MAX_EXTRA_FREE_TIME_DAYS,
  PREMIUM_CARGO_USD,
  type VasSelection,
} from "@/lib/vas";
import { useLocale, useT } from "../../providers/LocaleProvider";

/**
 * Page three of the real product, the part after "accept": value-added
 * services. A premium cargo service at a flat price, and detention free time
 * bought by the day at each end on top of the fourteen days every booking
 * already carries, with a − 0 + stepper. Observed 2026-09-11.
 */
export function VasPanel({
  value,
  units,
  onChange,
}: {
  value: VasSelection;
  units: number;
  onChange: (next: VasSelection) => void;
}) {
  const t = useT();
  const { locale } = useLocale();

  const stepper = (
    key: "extraFreeTimeOrigin" | "extraFreeTimeDestination",
    labelKey: string,
    perDay: number,
  ) => (
    <div className="flex flex-col gap-2 border border-border p-5 rounded-card">
      <span className="type-label">{t(labelKey)}</span>
      <span className="type-caption">
        {t("vas.freeTimeIncluded", { days: FREE_TIME_INCLUDED_DAYS })}
      </span>
      <div className="mt-1 flex items-center gap-3">
        <span className="type-caption">{t("vas.additional")}</span>
        <div className="flex items-center overflow-hidden border border-control rounded-card">
          <button
            type="button"
            onClick={() => onChange({ ...value, [key]: Math.max(0, value[key] - 1) })}
            disabled={value[key] === 0}
            aria-label={t("vas.fewer")}
            className="h-9 w-9 type-label disabled:opacity-40"
          >
            −
          </button>
          <span className="w-10 text-center type-label tnum" aria-live="polite">
            {value[key]}
          </span>
          <button
            type="button"
            onClick={() =>
              onChange({ ...value, [key]: Math.min(MAX_EXTRA_FREE_TIME_DAYS, value[key] + 1) })
            }
            disabled={value[key] >= MAX_EXTRA_FREE_TIME_DAYS}
            aria-label={t("vas.more")}
            className="h-9 w-9 type-label disabled:opacity-40"
          >
            +
          </button>
        </div>
        <span className="type-caption">{t("vas.days")}</span>
      </div>
      <span className="type-caption tnum">
        {t("vas.perDay", { usd: formatMoney(perDay, locale), units })}
        {value[key] > 0
          ? ` · $${formatMoney(perDay * units * value[key], locale)}`
          : ""}
      </span>
    </div>
  );

  return (
    <section className="flex flex-col gap-5">
      <div>
        <h2 className="type-section">{t("vas.title")}</h2>
        <p className="mt-1 max-w-[60ch] type-caption">{t("vas.lede")}</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <label className="flex cursor-pointer flex-col gap-2 border border-border p-5 rounded-card">
          <span className="flex items-center justify-between gap-4">
            <span className="type-label">{t("vas.premiumCargo")}</span>
            <input
              type="checkbox"
              checked={value.premiumCargo}
              onChange={(e) => onChange({ ...value, premiumCargo: e.target.checked })}
              className="h-4 w-4 accent-crimson"
            />
          </span>
          <span className="type-caption">{t("vas.premiumCargoBody")}</span>
          <span className="type-label tnum">${formatMoney(PREMIUM_CARGO_USD, locale)}</span>
        </label>
        {stepper("extraFreeTimeOrigin", "vas.freeTimeOrigin", EXTRA_FREE_TIME_USD_PER_DAY.origin)}
        {stepper("extraFreeTimeDestination", "vas.freeTimeDestination", EXTRA_FREE_TIME_USD_PER_DAY.destination)}
      </div>
    </section>
  );
}
