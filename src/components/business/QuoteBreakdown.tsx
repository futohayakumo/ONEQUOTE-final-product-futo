"use client";

import { usd, pct } from "@/lib/format";
import { CONTAINERS, LOYALTY_TIERS, PORTS } from "@/lib/pricing";
import { quoteForSailing, sailingDate, type Sailing } from "@/lib/sailings";
import type { PortCode, QuoteResult } from "@/types/quote";

/**
 * The comps put a four-line invoice here. This one has six, because that is
 * what `lib/pricing.ts` actually computes — and the arithmetic on this screen
 * has to be the arithmetic the quiz then asks about. A tidier fiction would
 * make the two screens disagree.
 */
export function QuoteBreakdown({
  quote,
  sailing,
  pol,
  pod,
}: {
  quote: QuoteResult;
  sailing: Sailing;
  pol: PortCode;
  pod: PortCode;
}) {
  const { lines, subtotal, discount, total } = quoteForSailing(
    { ...quote, containerLabel: CONTAINERS[quote.containerType].label },
    sailing,
  );

  return (
    <section className="flex flex-col gap-6">
      <h2 className="type-section">Cost breakdown</h2>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,20rem)]">
      <div className="border border-border bg-studio p-6 rounded-card shadow-card sm:p-8">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <span className="type-caption tnum">
            {quote.units} container{quote.units === 1 ? "" : "s"} ·{" "}
            {quote.teuAccrued} TEU
          </span>
        </div>

        <dl className="mt-6 flex flex-col">
          {lines.map((line) => (
            <div
              key={line.label}
              className="flex items-baseline justify-between gap-6 border-b border-border py-3.5"
            >
              <dt className="type-body">
                {line.label}
                {line.detail ? (
                  <span className="type-caption"> · {line.detail}</span>
                ) : null}
              </dt>
              <dd className="type-label tnum">${usd(line.amount)}</dd>
            </div>
          ))}

          <div className="flex items-baseline justify-between gap-6 border-b border-border py-3.5">
            <dt className="type-body">Subtotal</dt>
            <dd className="type-label tnum">${usd(subtotal)}</dd>
          </div>

          <div className="flex items-baseline justify-between gap-6 border-b border-border py-3.5">
            <dt className="type-body">
              {LOYALTY_TIERS[quote.tier].label}
              <span className="type-caption"> · {pct(quote.discountRate)}</span>
            </dt>
            <dd className="type-label tnum">−${usd(discount)}</dd>
          </div>

          <div className="flex items-baseline justify-between gap-6 border-t-2 border-charcoal pt-5">
            <dt className="type-section">Total</dt>
            <dd className="type-section tnum">${usd(total)}</dd>
          </div>
        </dl>
      </div>

      {/* Same surface and elevation as the panel beside it — two cards in one
          row with different fills and different shadows read as an accident. */}
      <aside className="flex flex-col gap-4 border border-border bg-studio p-6 rounded-card shadow-card">
        <h3 className="type-label">Notes</h3>
        <ul className="flex list-disc flex-col gap-2 pl-4 type-caption">
          <li>Transit times are estimates.</li>
          <li>Rates are valid for {quote.validityHours} hours from quotation.</li>
          <li>Demurrage, detention and optional services are not included.</li>
          <li>
            {LOYALTY_TIERS[quote.tier].label} earns its next reward at{" "}
            <span className="tnum">{quote.nextMilestoneTeu} TEU</span>.
          </li>
        </ul>
        <dl className="mt-2 flex flex-col gap-2 border-t border-border pt-4">
          <div className="flex justify-between gap-4">
            <dt className="type-caption">Quotation</dt>
            <dd className="type-caption tnum text-charcoal">{quote.quoteId}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="type-caption">Lane</dt>
            <dd className="type-caption text-charcoal">
              {PORTS[pol].city} → {PORTS[pod].city}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="type-caption">Sails</dt>
            <dd className="type-caption tnum text-charcoal">
              {sailingDate(sailing.departsInDays)}
            </dd>
          </div>
        </dl>
      </aside>
      </div>
    </section>
  );
}
