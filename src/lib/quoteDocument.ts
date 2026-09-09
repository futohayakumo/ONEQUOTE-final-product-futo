import { accountTotal, allInTotal, type ChargeSection, type Incoterm } from "./charges.ts";
import { CONTAINERS, LOYALTY_TIERS, PORTS } from "./pricing.ts";
import { cutOffsFor, sailingAt, voyageOf, type Sailing } from "./sailings.ts";
import type { QuoteResult } from "@/types/quote";

/**
 * The quotation as a document, not as a screen.
 *
 * A rate is handed between systems far more often than it is looked at, so a
 * quotation that only exists as laid-out HTML is only half the deliverable.
 * This is the same numbers in the two shapes they actually travel in: JSON for
 * a partner integration, and a plain-text sheet for the mail body a customer
 * receives.
 *
 * Both are derived here rather than in the component, so the document and the
 * ticket can never drift — there is one function and two renderings of it.
 *
 * Dates are ISO, in UTC, taken from the same fixed reference the rest of the
 * app uses. Nothing here calls `new Date()`: the document has to be identical
 * on every render or it is not a document.
 *
 * The sibling imports carry their `.ts` extension. Every other module in this
 * directory gets away without one because its imports are all type-only and
 * are erased before Node sees them; this one needs the values at runtime, and
 * the node test runner does not resolve an extensionless relative path.
 */
export interface QuoteDocumentInput {
  quote: QuoteResult;
  sailing: Sailing;
  sections: ChargeSection[];
  incoterm: Incoterm;
}

const isoDay = (offsetDays: number) =>
  new Date(sailingAt(offsetDays)).toISOString().slice(0, 10);

const money = (n: number) => Math.round(n * 100) / 100;

export function quoteDocument({
  quote,
  sailing,
  sections,
  incoterm,
}: QuoteDocumentInput) {
  const yours = accountTotal(sections);
  const discount = money(yours * quote.discountRate);
  const arrival = sailing.departsInDays + sailing.transitDays;

  return {
    documentType: "RATE_QUOTATION",
    version: "1.0",
    reference: quote.quoteId,
    incoterm,
    currency: "USD",
    validity: { hours: quote.validityHours, basis: "FROM_ISSUE" },
    routing: {
      portOfLoading: { code: quote.pol, city: PORTS[quote.pol].city },
      portOfDischarge: { code: quote.pod, city: PORTS[quote.pod].city },
      transhipment: sailing.via,
      transitDays: sailing.transitDays,
    },
    vessel: {
      name: sailing.vessel,
      voyage: voyageOf(sailing),
      service: sailing.service,
      etd: isoDay(sailing.departsInDays),
      eta: isoDay(arrival),
    },
    cargo: {
      volumeCbm: quote.cbm,
      containerType: quote.containerType,
      containerDescription: CONTAINERS[quote.containerType].label,
      units: quote.units,
      teu: quote.teuAccrued,
    },
    charges: sections.map((section) => ({
      section: section.id,
      port: section.port ?? null,
      onAccount: section.onAccount,
      lines: section.lines.map((line) => ({
        code: line.code,
        amount: money(line.amount),
      })),
      subtotal: money(section.subtotal),
    })),
    loyalty: {
      tier: quote.tier,
      tierName: LOYALTY_TIERS[quote.tier].label,
      discountRate: quote.discountRate,
      teuAccrued: quote.teuAccrued,
      nextMilestoneTeu: quote.nextMilestoneTeu,
    },
    totals: {
      onYourAccount: money(yours),
      loyaltyDiscount: discount,
      payable: money(yours - discount),
      allInBothAccounts: money(allInTotal(sections)),
    },
    cutOffs: cutOffsFor(sailing).map((cut) => ({
      id: cut.labelKey.replace(/^cutoff\./, "").replace(/Detail$/, ""),
      date: isoDay(cut.offsetDays),
    })),
  };
}

export function quoteDocumentJson(input: QuoteDocumentInput): string {
  return JSON.stringify(quoteDocument(input), null, 2);
}

/** The same document as the plain-text sheet that goes in a mail body. */
export function quoteDocumentText(input: QuoteDocumentInput): string {
  const d = quoteDocument(input);
  const pad = (label: string) => `${label}:`.padEnd(22, " ");
  const row = (code: string, amount: number) =>
    `  ${code.padEnd(8, " ")}${("USD " + amount.toFixed(2)).padStart(16, " ")}`;

  const lines: string[] = [
    "RATE QUOTATION",
    "=".repeat(46),
    `${pad("Reference")}${d.reference}`,
    `${pad("Incoterm")}${d.incoterm}`,
    `${pad("Validity")}${d.validity.hours}h from issue`,
    "",
    `${pad("Routing")}${d.routing.portOfLoading.code} -> ${d.routing.portOfDischarge.code}`
      + (d.routing.transhipment ? ` via ${d.routing.transhipment}` : " direct"),
    `${pad("Vessel / voyage")}${d.vessel.name} / ${d.vessel.voyage}`,
    `${pad("ETD / ETA")}${d.vessel.etd} / ${d.vessel.eta}  (${d.routing.transitDays} days)`,
    `${pad("Cargo")}${d.cargo.volumeCbm} CBM, ${d.cargo.units} x ${d.cargo.containerDescription}`,
    `${pad("Loyalty tier")}${d.loyalty.tierName} (${(d.loyalty.discountRate * 100).toFixed(2)}%)`,
    "",
    "CHARGES",
    "-".repeat(46),
  ];

  for (const section of d.charges) {
    const head = section.port ? `${section.section} (${section.port})` : section.section;
    lines.push(
      `${head.toUpperCase()}${section.onAccount ? "" : "   [counterparty]"}`,
    );
    for (const line of section.lines) lines.push(row(line.code, line.amount));
    lines.push(row("subtotal", section.subtotal), "");
  }

  lines.push(
    "-".repeat(46),
    row("account", d.totals.onYourAccount),
    row("discount", -d.totals.loyaltyDiscount),
    row("PAYABLE", d.totals.payable),
    "",
    `All-in, both accounts: USD ${d.totals.allInBothAccounts.toFixed(2)}`,
    `TEU accrued: ${d.loyalty.teuAccrued} (next reward at ${d.loyalty.nextMilestoneTeu})`,
    "",
    "CUT-OFFS",
    "-".repeat(46),
    ...d.cutOffs.map((cut) => `  ${cut.id.padEnd(16, " ")}${cut.date}`),
    "",
    "Surcharges are quoted as of today and re-priced at booking.",
    "Duty, taxes, inspection and cargo insurance are excluded.",
  );

  return lines.join("\n");
}
