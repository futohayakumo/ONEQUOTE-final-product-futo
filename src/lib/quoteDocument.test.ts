import assert from "node:assert/strict";
import test from "node:test";
import { chargeSections } from "./charges.ts";
import { calculateQuote } from "./pricing.ts";
import { sailingsFor } from "./sailings.ts";
import { quoteDocument, quoteDocumentJson, quoteDocumentText } from "./quoteDocument.ts";

const input = {
  pol: "JPYOK",
  pod: "SGSIN",
  cbm: 90,
  containerType: "20GP",
  tier: "SILVER_SAIL",
} as const;

function build(incoterm: "FOB" | "DDP" = "FOB") {
  const quote = calculateQuote(input);
  const sailing =
    sailingsFor(input.pol, input.pod).find((s) => s.recommended) ??
    sailingsFor(input.pol, input.pod)[0];
  const sections = chargeSections({
    pol: input.pol,
    pod: input.pod,
    containerType: input.containerType,
    units: quote.units,
    oceanFreight: quote.oceanFreight * sailing.rateFactor,
    incoterm,
  });
  return { quote, sailing, sections, incoterm };
}

test("the document is valid JSON and round-trips", () => {
  const json = quoteDocumentJson(build());
  const parsed = JSON.parse(json);
  assert.equal(parsed.documentType, "RATE_QUOTATION");
  assert.match(parsed.reference, /^QTN-[0-9A-F]{6}$/);
  assert.equal(parsed.currency, "USD");
});

test("the totals in the document are the totals on the ticket", () => {
  const args = build();
  const d = quoteDocument(args);
  const onAccount = args.sections
    .filter((s) => s.onAccount)
    .reduce((n, s) => n + s.subtotal, 0);
  assert.equal(d.totals.onYourAccount, Math.round(onAccount * 100) / 100);
  assert.equal(
    d.totals.payable,
    Math.round((onAccount - onAccount * args.quote.discountRate) * 100) / 100,
  );
  // Every section is present whether or not it is billed to the reader.
  assert.equal(d.charges.length, args.sections.length);
});

test("the Incoterm moves which sections are on account, not the all-in", () => {
  const fob = quoteDocument(build("FOB"));
  const ddp = quoteDocument(build("DDP"));
  assert.equal(fob.totals.allInBothAccounts, ddp.totals.allInBothAccounts);
  assert.ok(
    ddp.totals.onYourAccount > fob.totals.onYourAccount,
    "DDP puts more of the same invoice on the buyer",
  );
});

test("dates are ISO and ordered", () => {
  const d = quoteDocument(build());
  for (const iso of [d.vessel.etd, d.vessel.eta, ...d.cutOffs.map((c) => c.date)]) {
    assert.match(iso, /^\d{4}-\d{2}-\d{2}$/);
  }
  assert.ok(d.vessel.etd < d.vessel.eta);
  // Every cut-off is counted back from departure, so all of them precede it.
  for (const cut of d.cutOffs) assert.ok(cut.date < d.vessel.etd, cut.id);
});

test("the document does not read the clock", () => {
  // Two builds a moment apart must be byte-identical, or it is not a document.
  assert.equal(quoteDocumentJson(build()), quoteDocumentJson(build()));
});

test("the text sheet carries the reference, the payable and every code", () => {
  const args = build();
  const text = quoteDocumentText(args);
  const d = quoteDocument(args);
  assert.ok(text.startsWith("RATE QUOTATION"));
  assert.ok(text.includes(d.reference));
  assert.ok(text.includes(d.totals.payable.toFixed(2)));
  for (const section of args.sections) {
    for (const line of section.lines) assert.ok(text.includes(line.code), line.code);
  }
});
