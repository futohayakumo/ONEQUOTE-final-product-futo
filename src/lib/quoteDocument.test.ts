import assert from "node:assert/strict";
import { test } from "node:test";
import { chargeSections, allInTotal } from "./charges.ts";
import { calculateQuote } from "./pricing.ts";
import { optionsFrom } from "./sailings.ts";
import { quoteDocument, quoteDocumentJson, quoteDocumentText } from "./quoteDocument.ts";
import { NO_VAS } from "./vas.ts";

const quote = calculateQuote({
  pol: "JPYOK",
  pod: "SGSIN",
  containers: [{ equipment: "DRY20", quantity: 3, weightKg: 36_000 }],
  commodity: "GENERAL",
  tier: "SILVER_SAIL",
  originScope: "CY",
  destinationScope: "DOOR",
});
const sailing = optionsFrom("JPYOK", "SGSIN", 0).find((s) => s.recommended)!;
const sections = chargeSections({
  pol: "JPYOK",
  pod: "SGSIN",
  rows: quote.rows,
  originScope: "CY",
  destinationScope: "DOOR",
  oceanFreight: quote.oceanFreight * sailing.rateFactor,
});
const input = { quote, sailing, sections, vas: NO_VAS };

test("the document carries the ticket's own totals, not a recomputation", () => {
  const d = quoteDocument(input);
  assert.equal(d.totals.charges, allInTotal(sections));
  assert.equal(d.totals.loyaltyDiscount, Math.round(quote.oceanFreight * sailing.rateFactor * 0.03 * 100) / 100);
  assert.equal(d.totals.payable, Math.round((d.totals.charges - d.totals.loyaltyDiscount) * 100) / 100);
  assert.equal(d.scope.destination, "DOOR");
  assert.ok(d.charges[2].lines.some((l) => l.code === "DHC"));
});

test("value-added services are lines on the document and in the total", () => {
  const d = quoteDocument({ ...input, vas: { premiumCargo: true, extraFreeTimeOrigin: 0, extraFreeTimeDestination: 2 } });
  assert.equal(d.valueAddedServices.subtotal, 400 + 55 * 3 * 2);
  assert.equal(d.valueAddedServices.freeTimeIncludedDays, 14);
  assert.equal(d.totals.payable, Math.round((d.totals.charges - d.totals.loyaltyDiscount + d.valueAddedServices.subtotal) * 100) / 100);
});

test("dates are ISO days from the fixed reference and the same on every machine", () => {
  const d = quoteDocument(input);
  assert.equal(d.sailing.etd, "2026-09-18");
  assert.match(d.cutOffs[0].date, /^\d{4}-\d{2}-\d{2}$/);
});

test("JSON is the document verbatim and the text carries every code and the total", () => {
  assert.deepEqual(JSON.parse(quoteDocumentJson(input)), quoteDocument(input));
  const text = quoteDocumentText(input);
  for (const code of ["THC", "O/F", "BAF", "DHC", "TOTAL PAYABLE"]) assert.ok(text.includes(code), code);
  assert.ok(text.includes("14 days each end"));
});
