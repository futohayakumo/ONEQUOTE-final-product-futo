import { CONTAINERS, LOYALTY_TIERS, PORTS } from "@/lib/pricing";
import { pct, usd } from "@/lib/format";
import type { QuoteResult } from "@/types/quote";
import { DataRow } from "../ui/DataRow";
import { SectionTitle } from "../ui/SectionTitle";

export function QuoteSummary({ quote }: { quote: QuoteResult }) {
  const container = CONTAINERS[quote.containerType];
  const loyalty = LOYALTY_TIERS[quote.tier];

  return (
    <div className="flex flex-col gap-5 border border-border bg-studio p-6 rounded-sharp">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <SectionTitle>Indicative quotation</SectionTitle>
        <span className="type-caption tnum">{quote.quoteId}</span>
      </div>

      <p className="type-caption">
        {PORTS[quote.pol].city} ({quote.pol}) to {PORTS[quote.pod].city} (
        {quote.pod}) &middot; {quote.cbm} CBM &middot; {container.label} &middot;{" "}
        {quote.units} unit{quote.units === 1 ? "" : "s"}
      </p>

      <div className="flex flex-col">
        <DataRow
          label={`Ocean freight — ${quote.units} × ${container.label} @ ${usd(quote.laneBase)} × ${quote.multiplier}`}
          value={usd(quote.oceanFreight)}
        />
        <DataRow
          label={`Terminal handling — ${quote.cbm} CBM × 4.50`}
          value={usd(quote.terminalHandling)}
        />
        <DataRow label="Documentation fee" value={usd(quote.documentation)} />
        <DataRow
          label="Bunker adjustment (BAF 12%)"
          value={usd(quote.bunkerAdjustment)}
        />
        <DataRow label="Subtotal" value={usd(quote.subtotal)} emphasis />
        <DataRow
          label={`Volume Loyalty Framework — ${loyalty.label} ${pct(quote.discountRate)}`}
          value={`-${usd(quote.loyaltyDiscount)}`}
          negative
        />
        <DataRow label="Total (USD)" value={usd(quote.total)} emphasis />
      </div>

      <div className="flex flex-wrap gap-x-8 gap-y-2 border-t border-border pt-4">
        <span className="type-caption">
          TEU accrued <span className="tnum text-charcoal">{quote.teuAccrued}</span>
        </span>
        <span className="type-caption">
          Next {loyalty.label} milestone{" "}
          <span className="tnum text-charcoal">{quote.nextMilestoneTeu} TEU</span>
        </span>
        <span className="type-caption">
          Rate held by Quotation Flex Cart for{" "}
          <span className="tnum text-charcoal">{quote.validityHours}h</span>
        </span>
      </div>
    </div>
  );
}
