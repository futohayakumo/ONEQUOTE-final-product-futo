import assert from "node:assert/strict";
import { test } from "node:test";
import { allInTotal, chargeSections, groupTotal } from "./charges.ts";
import { calculateQuote } from "./pricing.ts";

const quote = calculateQuote({
  pol: "JPYOK",
  pod: "SGSIN",
  containers: [{ equipment: "DRY20", quantity: 3, weightKg: 36_000 }],
  commodity: "GENERAL",
  tier: "SILVER_SAIL",
  originScope: "CY",
  destinationScope: "CY",
});

const cy = chargeSections({
  pol: "JPYOK",
  pod: "SGSIN",
  rows: quote.rows,
  originScope: "CY",
  destinationScope: "CY",
  oceanFreight: quote.oceanFreight,
});

test("every section's lines add up to its own subtotal", () => {
  for (const s of cy) {
    assert.equal(s.subtotal, Math.round(s.lines.reduce((n, l) => n + l.amount, 0) * 100) / 100);
  }
});

test("terminal handling is charged per container, not per volume", () => {
  const thc = cy[0].lines.find((l) => l.code === "THC")!;
  assert.equal(thc.amount, 182 * 3); // Japan's THC, per container
  assert.deepEqual(thc.basisVars, { units: 3 });
});

test("per-bill-of-lading charges do not scale with the box count", () => {
  const one = chargeSections({
    pol: "JPYOK",
    pod: "SGSIN",
    rows: calculateQuote({ ...quote, containers: [{ equipment: "DRY20", quantity: 1, weightKg: 12_000 }] }).rows,
    originScope: "CY",
    destinationScope: "CY",
    oceanFreight: 1144,
  });
  const doc = (s: typeof cy) => s[0].lines.find((l) => l.code === "DOC")!.amount;
  assert.equal(doc(cy), doc(one));
});

test("Door adds haulage at that end only, and nowhere else changes", () => {
  const door = chargeSections({
    pol: "JPYOK",
    pod: "SGSIN",
    rows: quote.rows,
    originScope: "DOOR",
    destinationScope: "CY",
    oceanFreight: quote.oceanFreight,
  });
  assert.ok(door[0].lines.some((l) => l.code === "OHC"));
  assert.ok(!door[2].lines.some((l) => l.code === "DHC"));
  assert.equal(door[1].subtotal, cy[1].subtotal);
  assert.equal(door[2].subtotal, cy[2].subtotal);
  assert.equal(allInTotal(door) - allInTotal(cy), 260 * 3); // Japan's haulage, per container
});

test("the four freight-view groups partition every line", () => {
  const all = groupTotal(cy, ["basicOceanFreight", "freightCharge", "originCharge", "destinationCharge"]);
  assert.equal(all, allInTotal(cy));
  assert.equal(groupTotal(cy, ["basicOceanFreight"]), 3432);
  assert.equal(groupTotal(cy, ["freightCharge"]), Math.round((3432 * 0.12 + 3432 * 0.025) * 100) / 100);
});

test("BAF and CAF track the ocean freight they are charged on", () => {
  const ocean = cy[1].lines;
  const of = ocean.find((l) => l.code === "O/F")!.amount;
  assert.equal(ocean.find((l) => l.code === "BAF")!.amount, Math.round(of * 0.12 * 100) / 100);
  assert.equal(ocean.find((l) => l.code === "CAF")!.amount, Math.round(of * 0.025 * 100) / 100);
});

test("reefer and overweight surcharges appear only for the boxes that earn them", () => {
  const q = calculateQuote({
    pol: "JPYOK",
    pod: "SGSIN",
    containers: [
      { equipment: "DRY20", quantity: 2, weightKg: 52_000 },
      { equipment: "REEFER20", quantity: 1, weightKg: 10_000 },
    ],
    commodity: "CHILLED_FOOD",
    tier: "BLUE_WAVE",
    originScope: "CY",
    destinationScope: "CY",
  });
  const s = chargeSections({ pol: "JPYOK", pod: "SGSIN", rows: q.rows, originScope: "CY", destinationScope: "CY", oceanFreight: q.oceanFreight });
  const ocean = s[1].lines;
  assert.equal(ocean.find((l) => l.code === "RFS")!.amount, 350);
  assert.equal(ocean.find((l) => l.code === "OWS")!.amount, 120 * 2);
});
