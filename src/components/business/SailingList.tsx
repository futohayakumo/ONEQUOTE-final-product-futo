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

                  <span className="flex min-w-[11rem] flex-col gap-1">
                    {s.recommended ? (
                      <span className="mb-1 self-start bg-tint px-2.5 py-1 type-caption text-crimson-ink rounded-full">
                        {t("business.sailings.recommended")}
                      </span>
                    ) : null}
                    <span className="type-label">{s.vessel}</span>
                    <span className="type-caption">
                      {s.via ? t("quote.viaPort", { port: s.via }) : s.service}
                    </span>
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
