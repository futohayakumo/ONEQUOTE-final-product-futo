"use client";

import Link from "next/link";
import { accountTotal, chargeSections, type ChargeLine } from "@/lib/charges";
import { CONTAINERS, LOYALTY_TIERS, PORTS, calculateQuote } from "@/lib/pricing";
import { sailingAt, sailingsFor } from "@/lib/sailings";
import { formatDate, formatMoney } from "@/lib/localeFormat";
import { ArrowRight } from "../icons/ArrowRight";
import { useLocale, useT } from "../shell/LocaleProvider";

/**
 * One real quotation, priced at module scope.
 *
 * The hero's job is to say what this site computes, and the cheapest way to say
 * it is to compute something in the first screenful. A photograph of a berth
 * can be had by anyone; a working pricing engine cannot, and putting the
 * photograph where the evidence should be makes the real arithmetic further
 * down the page read as decoration too.
 *
 * Every figure comes out of pricing.ts, sailings.ts and charges.ts — the same
 * three modules the business screen runs — so this cannot drift from it.
 * Change a constant there and this card changes, or the build fails.
 */
const INPUT = {
  pol: "JPYOK",
  pod: "SGSIN",
  cbm: 90,
  containerType: "20GP",
  tier: "SILVER_SAIL",
} as const;

const QUOTE = calculateQuote(INPUT);
const SAILINGS = sailingsFor(INPUT.pol, INPUT.pod);
const SAILING = SAILINGS.find((s) => s.recommended) ?? SAILINGS[0];

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
 * Taking the largest charges across every section would put a destination fee
 * under a heading that says "on your account" and leave a list that does not
 * add up to the total printed beneath it. Under FOB the buyer's account is the
 * origin section; the rest is shown in full on the business screen, where
 * there is room to show it struck through.
 */
const LINES: ChargeLine[] = SECTIONS.filter((s) => s.onAccount).flatMap(
  (s) => s.lines,
);

export function QuoteGlance() {
  const t = useT();
  const { locale } = useLocale();
  const arrival = SAILING.departsInDays + SAILING.transitDays;

  return (
    <figure className="flex w-full max-w-[26rem] flex-col gap-4">
      <div className="overflow-hidden border border-border bg-studio rounded-card shadow-raised">
        <header className="flex items-baseline justify-between gap-4 bg-charcoal px-5 py-3">
          <span className="type-overline text-studio">
            {t("home.glance.eyebrow")}
          </span>
          <span className="type-caption tnum text-border">
            {t("home.glance.validity", { hours: QUOTE.validityHours })}
          </span>
        </header>

        <dl className="grid grid-cols-2 gap-x-5 gap-y-3 px-5 py-4">
          <div className="col-span-2">
            <dt className="type-caption">{t("quote.route")}</dt>
            <dd className="mt-0.5 type-label">
              {PORTS[INPUT.pol].city} → {PORTS[INPUT.pod].city}
            </dd>
          </div>
          <div>
            <dt className="type-caption">{t("quote.container")}</dt>
            <dd className="mt-0.5 type-label tnum">
              {CONTAINERS[INPUT.containerType].label} × {QUOTE.units}
            </dd>
          </div>
          <div>
            <dt className="type-caption">{t("quote.tier")}</dt>
            <dd className="mt-0.5 type-label">{LOYALTY_TIERS[INPUT.tier].label}</dd>
          </div>
          <div>
            <dt className="type-caption">{t("quote.departs")}</dt>
            <dd className="mt-0.5 type-label tnum">
              {formatDate(sailingAt(SAILING.departsInDays), locale)}
            </dd>
          </div>
          <div>
            <dt className="type-caption">{t("quote.arrives")}</dt>
            <dd className="mt-0.5 type-label tnum">
              {formatDate(sailingAt(arrival), locale)}
            </dd>
          </div>
        </dl>

        <div className="border-t border-border px-5 py-4">
          <p className="type-overline text-muted">{t("quote.onYourAccount")}</p>
          <ul className="mt-3 flex flex-col gap-1.5">
            {LINES.map((line) => (
              <li key={line.code} className="flex items-baseline justify-between gap-4">
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
          <span className="type-section tnum">${formatMoney(YOURS, locale)}</span>
        </div>

        {/* The caption belongs INSIDE the card. It sat under it first, which
            put muted grey type straight onto the photograph — legible on the
            dark water at the left of the frame and gone against the sky. Type
            over a picture needs a ground, and the card already is one. */}
        <figcaption className="flex flex-col gap-2 border-t border-border px-5 py-4">
          <p className="type-caption">{t("home.glance.note")}</p>
          <Link
            href="/business"
            className="inline-flex items-center gap-2 self-start type-caption text-crimson-ink underline underline-offset-4 transition-colors duration-150 hover:text-charcoal"
          >
            {t("home.glance.cta")}
            <ArrowRight size={14} />
          </Link>
        </figcaption>
      </div>
    </figure>
  );
}
