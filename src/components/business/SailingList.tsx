"use client";

import cn from "clsx";
import { formatDate, formatMoney, formatWeekday } from "@/lib/localeFormat";
import { PORTS } from "@/lib/pricing";
import { sailingAt, type Sailing } from "@/lib/sailings";
import type { PortCode } from "@/types/quote";
import { ArrowRight } from "../icons/ArrowRight";
import { useLocale, useT } from "../shell/LocaleProvider";

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
  const t = useT();
  const { locale } = useLocale();

  /*
   * A list of three prices is not a comparison; it is three prices.
   *
   * The reader's actual question is what the cheaper sailing costs them in
   * days and what the faster one costs them in money, and that is a
   * subtraction they should not have to do in their head. The baseline is the
   * recommended sailing because that is the one the page already argues for.
   */
  const baseline = sailings.find((s) => s.recommended) ?? sailings[0];
  const basePrice = baseline ? priceFor(baseline) : 0;
  const cheapest = sailings.reduce(
    (best, s) => (priceFor(s) < priceFor(best) ? s : best),
    sailings[0],
  );
  const fastest = sailings.reduce(
    (best, s) => (s.transitDays < best.transitDays ? s : best),
    sailings[0],
  );

  const priceDelta = (n: number) =>
    n === 0
      ? t("business.sail.samePrice")
      : t(n > 0 ? "business.sail.morePrice" : "business.sail.lessPrice", {
          amount: `$${formatMoney(Math.abs(n), locale)}`,
        });

  const dayDelta = (n: number) =>
    n === 0
      ? t("business.sail.sameDays")
      : t(n > 0 ? "business.sail.moreDays" : "business.sail.lessDays", {
          days: Math.abs(n),
        });

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="type-section">{t("business.sailings.title")}</h2>
        <p className="type-caption">
          {t("business.sailings.lede", { count: sailings.length })}
        </p>
      </div>

      <fieldset>
        <legend className="sr-only">{t("business.sailings.choose")}</legend>
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

                  <span className="flex min-w-[12rem] flex-col gap-1">
                    <span className="mb-1 flex flex-wrap gap-1.5">
                      {s.recommended ? (
                        <span className="bg-tint px-2.5 py-1 type-caption text-crimson-ink rounded-full">
                          {t("business.sailings.recommended")}
                        </span>
                      ) : null}
                      {s.id === cheapest.id && !s.recommended ? (
                        <span className="border border-border px-2.5 py-1 type-caption rounded-full">
                          {t("business.sail.cheapest")}
                        </span>
                      ) : null}
                      {s.id === fastest.id && !s.recommended ? (
                        <span className="border border-border px-2.5 py-1 type-caption rounded-full">
                          {t("business.sail.fastest")}
                        </span>
                      ) : null}
                    </span>
                    <span className="type-label">{s.vessel}</span>
                    <span className="type-caption">{s.service}</span>
                    {s.via ? (
                      <span className="type-caption">
                        {t("quote.viaPort", { port: s.via })}
                      </span>
                    ) : null}
                  </span>

                  <span className="flex flex-col gap-1">
                    <span className="type-caption">{t("business.sailings.departure")}</span>
                    <span className="type-label tnum">
                      {formatDate(sailingAt(s.departsInDays), locale)}
                    </span>
                    <span className="type-caption tnum">
                      {formatWeekday(sailingAt(s.departsInDays), locale)} · {pol}
                    </span>
                  </span>

                  <span aria-hidden className="text-muted">
                    <ArrowRight size={18} />
                  </span>

                  <span className="flex flex-col gap-1">
                    <span className="type-caption">{t("business.sailings.arrival")}</span>
                    <span className="type-label tnum">
                      {formatDate(sailingAt(s.departsInDays + s.transitDays), locale)}
                    </span>
                    <span className="type-caption tnum">
                      {formatWeekday(sailingAt(s.departsInDays + s.transitDays), locale)} · {pod}
                    </span>
                  </span>

                  <span className="flex flex-col gap-1">
                    <span className="type-caption">{t("business.sailings.transit")}</span>
                    <span className="type-label tnum">
                      {t("quote.transitDays", { days: s.transitDays })}
                    </span>
                    <span className="type-caption">
                      {s.via ? t("business.sailings.stop") : t("quote.direct")}
                    </span>
                  </span>

                  <span className="ml-auto flex flex-col items-end gap-1">
                    <span className="type-section tnum">
                      ${formatMoney(priceFor(s), locale)}
                    </span>
                    <span className="type-caption">
                      {PORTS[pol].city} → {PORTS[pod].city}
                    </span>
                    {baseline && s.id !== baseline.id ? (
                      <span className="max-w-[22rem] text-right type-caption text-charcoal">
                        {t("business.sail.compare", {
                          price: priceDelta(priceFor(s) - basePrice),
                          days: dayDelta(s.transitDays - baseline.transitDays),
                        })}
                      </span>
                    ) : null}
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
