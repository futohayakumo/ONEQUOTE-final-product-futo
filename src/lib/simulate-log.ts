import { CONTAINERS, LOYALTY_TIERS } from "./pricing";
import { isoMs, offsetMs, pct, usd } from "./format";
import type { QuoteResult } from "@/types/quote";

/**
 * Renders the transaction trace shown in the Dark Slate console.
 *
 * Determinism: the caller captures `baseEpochMs` ONCE inside the submit
 * handler — a user gesture, post-hydration — so no timestamp is ever produced
 * during render and a hydration mismatch is impossible. Every subsequent line
 * is baseEpoch + a fixed offset.
 */

export const FIXED_OFFSETS = [0, 12, 48, 91, 134, 176, 203, 241, 268, 268] as const;

export type LogTone = "meta" | "key" | "value" | "success";

export interface LogSpan {
  text: string;
  tone: LogTone;
}

export interface LogLine {
  id: string;
  spans: LogSpan[];
}

const meta = (text: string): LogSpan => ({ text, tone: "meta" });
const key = (text: string): LogSpan => ({ text, tone: "key" });
const val = (text: string): LogSpan => ({ text, tone: "value" });

export function buildTransactionLog(
  quote: QuoteResult,
  baseEpochMs: number,
): LogLine[] {
  const container = CONTAINERS[quote.containerType];
  const loyalty = LOYALTY_TIERS[quote.tier];
  const validUntil = isoMs(baseEpochMs + quote.validityHours * 3_600_000);
  const trace = quote.quoteId.replace("QTN-", "");

  const at = (i: number) => meta(offsetMs(FIXED_OFFSETS[i]));

  return [
    {
      id: "l0",
      spans: [
        meta(`[${isoMs(baseEpochMs)}]  `),
        key("POST /v1/quotations  ->  "),
        val("Core Quotation Module"),
      ],
    },
    {
      id: "l1",
      spans: [
        at(0),
        key("  > headers   "),
        val(
          `{ content-type: application/json, x-trace-id: qtn_${trace}, x-tenant: global-liner-alliance, x-client-tier: ${quote.tier} }`,
        ),
      ],
    },
    {
      id: "l2",
      spans: [
        at(1),
        key("  > payload   "),
        val(
          `{ pol: ${quote.pol}, pod: ${quote.pod}, cargo_volume_cbm: ${quote.cbm}, container_type: ${quote.containerType}, loyalty_tier: ${quote.tier} }`,
        ),
      ],
    },
    {
      id: "l3",
      spans: [
        at(2),
        key("  < Core Quotation Module    resolve_lane "),
        val(`${quote.pol}->${quote.pod}`),
        key("  base_rate="),
        val(`${usd(quote.laneBase)} USD/unit`),
      ],
    },
    {
      id: "l4",
      spans: [
        at(3),
        key("  < Core Quotation Module    container_plan "),
        val(
          `{ type: ${quote.containerType}, capacity_cbm: ${container.capacityCbm}, units: ${quote.units}, multiplier: ${quote.multiplier} }`,
        ),
      ],
    },
    {
      id: "l5",
      spans: [
        at(4),
        key("  -> Legacy ERP Engine       RPC booking.rate.reserve  ttl="),
        val(`${quote.validityHours}h`),
      ],
    },
    {
      id: "l6",
      spans: [
        at(5),
        key("  < Legacy ERP Engine        ocean_freight="),
        val(usd(quote.oceanFreight)),
        key("  thc_cbm="),
        val(usd(quote.terminalHandling)),
        key("  documentation="),
        val(usd(quote.documentation)),
        key("  baf="),
        val(usd(quote.bunkerAdjustment)),
      ],
    },
    {
      id: "l7",
      spans: [
        at(6),
        key("  < Volume Loyalty Framework tier="),
        val(loyalty.label),
        key("  rate="),
        val(pct(quote.discountRate)),
        key("  discount="),
        val(`-${usd(quote.loyaltyDiscount)}`),
        key("  teu_accrued="),
        val(String(quote.teuAccrued)),
        key("  next_milestone_teu="),
        val(String(quote.nextMilestoneTeu)),
      ],
    },
    {
      id: "l8",
      spans: [
        at(7),
        key("  < Quotation Flex Cart      rate held  cart_ref="),
        val(`FLEX-${trace}`),
        key("  expires_in="),
        val(`${quote.validityHours}h`),
      ],
    },
    {
      id: "l9",
      spans: [
        at(8),
        key("  < response "),
        val(
          `{ quote_id: ${quote.quoteId}, currency: USD, subtotal: ${usd(quote.subtotal)}, discount: ${usd(quote.loyaltyDiscount)}, total: ${usd(quote.total)}, valid_until: ${validUntil} }`,
        ),
      ],
    },
    {
      id: "l10",
      spans: [at(9), { text: "  status: 200 OK", tone: "success" }],
    },
  ];
}

export function logLineText(line: LogLine): string {
  return line.spans.map((s) => s.text).join("");
}
