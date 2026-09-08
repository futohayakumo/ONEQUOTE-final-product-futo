"use client";

import Link from "next/link";
import {
  chargeSections,
  accountTotal,
  type ChargeLine,
} from "@/lib/charges";
import { CONTAINERS, LOYALTY_TIERS, PORTS, calculateQuote } from "@/lib/pricing";
import { sailingsFor, sailingAt } from "@/lib/sailings";
import { formatDate, formatMoney } from "@/lib/localeFormat";
import { ArrowRight } from "../icons/ArrowRight";
import { useLocale, useT } from "../shell/LocaleProvider";

/**
 * The hero's second column: one real quotation, not a picture of one.
 *
 * The hero used to be a full-bleed photograph of a berth with five abstract
 * words floating up the right edge — which told a reader nothing about what
 * this site does, and looked like an advertisement rather than a product. The
 * fastest way to say "this thing computes something" is to compute it in the
 * first screenful.
 *
 * Every figure below comes out of `pricing.ts`, `sailings.ts` and `charges.ts`
 * at module scope, so it cannot drift from the business screen: change a
 * constant there and this card changes with it, or the build fails. There is
 * no fixture and no screenshot.
 */
const INPUT = {
  pol: "JPYOK",
  pod: "SGSIN",
  cbm: 90,
  containerType: "20GP",
  tier: "SILVER_SAIL",
} as const;

const QUOTE = calculateQuote(INPUT);
const SAILING =
  sailingsFor(INPUT.pol, INPUT.pod).find((s) => s.recommended) ??
  sailingsFor(INPUT.pol, INPUT.pod)[0];

const SECTIONS = chargeSections({
  pol: INPUT.pol,
  pod: INPUT.pod,
  containerType: INPUT.containerType,
  units: QUOTE.units,
  oceanFreight: QUOTE.oceanFreight * SAILING.rateFactor,
  incoterm: "FOB",
});
const YOURS = accountTotal(SECTIONS);

/*
 * Only the lines the buyer actually pays.
 *
 * The first cut took the three largest charges across every section, which put
 * a destination handling fee under a heading that says "on your account" and
 * left a list that did not add up to the total printed below it. Under FOB the
 * buyer's account is the origin section; the rest is shown in full on the
 * business screen, where there is room to show it struck through.
 */
const LINES: ChargeLine[] = SECTIONS.filter((s) => s.onAccount).flatMap(
  (s) => s.lines,
);

export function QuoteGlance() {
  const t = useT();
  const { locale } = useLocale();
  const arrival = SAILING.departsInDays + SAILING.transitDays;

  return (
    <figure className="flex flex-col gap-4">
      <div className="overflow-hidden border border-border bg-studio rounded-card shadow-card">
        <header className="flex items-baseline justify-between gap-4 border-b border-border px-5 py-4">
          <span className="type-overline text-muted">
            {t("home.glance.eyebrow")}
          </span>
          <span className="type-caption tnum">
            {t("home.glance.validity", { hours: QUOTE.validityHours })}
          </span>
        </header>

        <dl className="grid grid-cols-2 gap-x-6 gap-y-3.5 px-5 py-4">
          <div className="col-span-2">
            <dt className="type-caption">{t("quote.route")}</dt>
            <dd className="mt-1 type-label">
              {PORTS[INPUT.pol].city} ({INPUT.pol}) → {PORTS[INPUT.pod].city} (
              {INPUT.pod})
            </dd>
          </div>
          <div>
            <dt className="type-caption">{t("quote.container")}</dt>
            <dd className="mt-1 type-label tnum">
              {CONTAINERS[INPUT.containerType].label} × {QUOTE.units}
            </dd>
          </div>
          <div>
            <dt className="type-caption">{t("quote.tier")}</dt>
            <dd className="mt-1 type-label">
              {LOYALTY_TIERS[INPUT.tier].label}
            </dd>
          </div>
          <div>
            <dt className="type-caption">{t("quote.departs")}</dt>
            <dd className="mt-1 type-label tnum">
              {formatDate(sailingAt(SAILING.departsInDays), locale)}
            </dd>
          </div>
          <div>
            <dt className="type-caption">{t("quote.arrives")}</dt>
            <dd className="mt-1 type-label tnum">
              {formatDate(sailingAt(arrival), locale)}
            </dd>
          </div>
        </dl>

        <div className="border-t border-border px-5 py-4">
          <p className="type-overline text-muted">{t("quote.onYourAccount")}</p>
          <ul className="mt-3 flex flex-col gap-2">
            {LINES.map((line) => (
              <li
                key={line.code}
                className="flex items-baseline justify-between gap-4"
              >
                <span className="type-caption">
                  <span className="tnum text-charcoal">{line.code}</span>{" "}
                  {t(line.labelKey)}
                </span>
                <span className="type-caption tnum text-charcoal">
                  ${formatMoney(line.amount, locale)}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-baseline justify-between gap-4 border-t border-border bg-canvas px-5 py-4">
          <span className="type-label">{t("quote.total")}</span>
          <span className="type-section tnum">
            ${formatMoney(YOURS, locale)}
          </span>
        </div>
      </div>

      <figcaption className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <p className="max-w-[34ch] type-caption">{t("home.glance.note")}</p>
        <Link
          href="/business"
          className="inline-flex items-center gap-2 type-caption text-crimson-ink underline underline-offset-4 transition-colors duration-150 hover:text-charcoal"
        >
          {t("home.glance.cta")}
          <ArrowRight size={14} />
        </Link>
      </figcaption>
    </figure>
  );
}
