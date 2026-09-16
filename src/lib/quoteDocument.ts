import type { Sailing } from "./sailings.ts";
import { EQUIPMENT, LOYALTY_TIERS } from "./pricing.ts";
import { portByCode } from "./ports.ts";
import { allInTotal, type ChargeSection } from "./charges.ts";
import { cutOffsFor, sailingAt, voyageLabel } from "./sailings.ts";
import { vasLines, vasTotal, FREE_TIME_INCLUDED_DAYS, type VasSelection } from "./vas.ts";
import type { QuoteResult } from "@/types/quote";

/**
 * The same quotation, as a document.
 *
 * The ticket is what a person reads. This is the SAME numbers, from the SAME
 * objects, in the two shapes a quotation actually travels in: JSON, as an
 * integration partner's system would receive it, and plain text, as it
 * would sit in the body of an email to the customer.
 *
 * Nothing is recomputed. Sections, totals and dates all arrive as arguments
 * — the same objects the ticket component is rendering — so the document
 * cannot drift from the screen.
 *
 * Dates are ISO, in UTC, taken from the same fixed reference the rest of the
 * app uses. Nothing here calls `new Date()`: the document has to be identical
 * on the server and in the browser.
 *
 * Imports carry `.ts` extensions so the node test runner can resolve them.
 */

export interface QuoteDocumentInput {
  quote: QuoteResult;
  sailing: Sailing;
  sections: ChargeSection[];
  vas: VasSelection;
}

const isoDay = (offsetDays: number) =>
  new Date(sailingAt(offsetDays)).toISOString().slice(0, 10);

const money = (n: number) => Math.round(n * 100) / 100;

export function quoteDocument({ quote, sailing, sections, vas }: QuoteDocumentInput) {
  const allIn = allInTotal(sections);
  const discount = money(quote.oceanFreight * sailing.rateFactor * quote.discountRate);
  const extras = vasLines(vas, quote.units);
  const extrasTotal = vasTotal(vas, quote.units);
  const payable = money(allIn - discount + extrasTotal);

  return {
    documentType: "RATE_QUOTATION",
    version: "2.0",
    reference: quote.quoteId,
    currency: "USD",
    validity: { hours: quote.validityHours, basis: "FROM_ISSUE" },
    scope: { origin: quote.originScope, destination: quote.destinationScope },
    routing: {
      portOfLoading: { code: quote.pol, city: portByCode(quote.pol)?.name ?? quote.pol },
      portOfDischarge: { code: quote.pod, city: portByCode(quote.pod)?.name ?? quote.pod },
      seaDistanceNm: quote.laneNm,
      transhipment: sailing.via,
      transitDays: sailing.transitDays,
    },
    sailing: {
      serviceLane: sailing.serviceLane,
      vessel: sailing.vessel,
      voyage: voyageLabel(sailing),
      status: sailing.status,
      etd: isoDay(sailing.etdOffset),
      eta: isoDay(sailing.etdOffset + sailing.transitDays),
    },
    cargo: {
      commodity: quote.commodity,
      containers: quote.rows.map((r) => ({
        equipment: r.equipment,
        description: EQUIPMENT[r.equipment].label,
        quantity: r.quantity,
        grossWeightKg: r.weightKg,
        teu: r.teu,
      })),
      units: quote.units,
      teu: quote.teuAccrued,
    },
    charges: sections.map((s) => ({
      section: s.id,
      port: s.port ?? null,
      scope: s.scope ?? null,
      lines: s.lines.map((l) => ({ code: l.code, group: l.group, amount: l.amount })),
      subtotal: s.subtotal,
    })),
    valueAddedServices: {
      freeTimeIncludedDays: FREE_TIME_INCLUDED_DAYS,
      lines: extras.map((l) => ({ id: l.id, amount: l.amount })),
      subtotal: extrasTotal,
    },
    loyalty: {
      tier: quote.tier,
      tierName: LOYALTY_TIERS[quote.tier].label,
      discountRate: quote.discountRate,
      discount,
      teuAccrued: quote.teuAccrued,
      nextMilestoneTeu: quote.nextMilestoneTeu,
    },
    totals: {
      charges: allIn,
      loyaltyDiscount: discount,
      valueAddedServices: extrasTotal,
      payable,
    },
    cutOffs: cutOffsFor(sailing).map((c) => ({ id: c.id, date: isoDay(c.offsetDays) })),
  };
}

export function quoteDocumentJson(input: QuoteDocumentInput): string {
  return JSON.stringify(quoteDocument(input), null, 2);
}

/** The email body. Fixed-width, so the amounts line up in a monospace client. */
export function quoteDocumentText(input: QuoteDocumentInput): string {
  const d = quoteDocument(input);
  const usd = (n: number) =>
    "USD " + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",").padStart(12);
  const row = (label: string, amount: number) => `  ${label.padEnd(34)}${usd(amount)}`;
  const lines: string[] = [];

  lines.push(`RATE QUOTATION ${d.reference}`);
  lines.push(`Valid ${d.validity.hours} hours from issue`);
  lines.push("");
  lines.push(
    `${d.routing.portOfLoading.city} (${d.routing.portOfLoading.code}, ${d.scope.origin}) -> ` +
      `${d.routing.portOfDischarge.city} (${d.routing.portOfDischarge.code}, ${d.scope.destination})`,
  );
  lines.push(
    `${d.sailing.vessel} ${d.sailing.voyage} · ${d.sailing.serviceLane} · ETD ${d.sailing.etd} · ETA ${d.sailing.eta} · ` +
      `${d.routing.transitDays} days` +
      (d.routing.transhipment ? ` via ${d.routing.transhipment}` : ", direct"),
  );
  lines.push(`Commodity: ${d.cargo.commodity}`);
  for (const c of d.cargo.containers) {
    lines.push(`${c.quantity} x ${c.description} · ${c.grossWeightKg.toLocaleString("en-US")} kg`);
  }
  lines.push("");

  for (const s of d.charges) {
    const heading = s.port ? `${s.section.toUpperCase()} — ${s.port} (${s.scope})` : s.section.toUpperCase();
    lines.push(heading);
    for (const l of s.lines) lines.push(row(l.code, l.amount));
    lines.push(row("Subtotal", s.subtotal));
    lines.push("");
  }

  if (d.valueAddedServices.lines.length) {
    lines.push("VALUE-ADDED SERVICES");
    for (const l of d.valueAddedServices.lines) lines.push(row(l.id, l.amount));
    lines.push(row("Subtotal", d.valueAddedServices.subtotal));
    lines.push("");
  }

  lines.push(row("Charges", d.totals.charges));
  lines.push(row(`${d.loyalty.tierName} ${(d.loyalty.discountRate * 100).toFixed(0)}%`, -d.totals.loyaltyDiscount));
  if (d.totals.valueAddedServices) lines.push(row("Value-added services", d.totals.valueAddedServices));
  lines.push(row("TOTAL PAYABLE", d.totals.payable));
  lines.push("");
  lines.push(`Free time included: ${d.valueAddedServices.freeTimeIncludedDays} days each end`);
  lines.push(
    "Cut-offs: " + d.cutOffs.map((c) => `${c.id} ${c.date}`).join(" · "),
  );
  return lines.join("\n");
}
