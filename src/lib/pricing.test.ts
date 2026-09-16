import assert from "node:assert/strict";
import { test } from "node:test";
import {
  EQUIPMENT,
  calculateQuote,
  emptyRow,
  laneBaseUsd,
  validateQuote,
} from "./pricing.ts";
import type { QuoteInput } from "@/types/quote";

const base: QuoteInput = {
  pol: "JPYOK",
  pod: "SGSIN",
  containers: [{ equipment: "DRY20", quantity: 3, weightKg: 36_000 }],
  commodity: "GENERAL",
  tier: "SILVER_SAIL",
  originScope: "CY",
  destinationScope: "CY",
  etdOffset: 0,
};

test("A. three 20' dry, Yokohama to Singapore: the fixture the ticket shows", () => {
  const q = calculateQuote({ ...base, pol: "JPYOK", pod: "SGSIN", commodity: "GENERAL", tier: "SILVER_SAIL" });
  // Yokohama–Singapore is 2,862 nm by the Singapore Strait: 686 + 0.16 × nm.
  assert.equal(q.laneNm, 2862);
  assert.equal(q.laneBase, 1144);
  assert.equal(q.units, 3);
  assert.equal(q.teuAccrued, 3);
  assert.equal(q.oceanFreight, 3432);
  assert.equal(q.rows[0].overweight, false);
  assert.equal(q.nextMilestoneTeu, 10);
  assert.match(q.quoteId, /^QTN-[0-9A-F]{6}$/);
});

test("B. mixed rows price per row and sum, and TEU counts forty-footers as two", () => {
  const q = calculateQuote({
    ...base,
    pol: "JPTYO",
    pod: "NLRTM",
    containers: [
      { equipment: "DRY20", quantity: 2, weightKg: 40_000 },
      { equipment: "REEFER40H", quantity: 1, weightKg: 18_000 },
    ],
    commodity: "CHILLED_FOOD",
    tier: "GOLDEN_SEA",
  } as QuoteInput & { pol: "JPTYO"; pod: "NLRTM"; commodity: "CHILLED_FOOD"; tier: "GOLDEN_SEA" });
  // Tokyo–Rotterdam, 10,915 nm via Singapore, Sri Lanka, Suez and the Channel.
  assert.equal(q.laneBase, 2432);
  assert.equal(q.rows[0].oceanFreight, 2432 * 1.0 * 2);
  assert.equal(q.rows[1].oceanFreight, Math.round(2432 * 2.6 * 100) / 100);
  assert.equal(q.oceanFreight, Math.round((4864 + 2432 * 2.6) * 100) / 100);
  assert.equal(q.units, 3);
  assert.equal(q.teuAccrued, 2 + 2);
  assert.equal(q.rows[1].reefer, true);
});

test("C. the same inputs always yield the same reference, and a changed weight changes it", () => {
  const a = calculateQuote({ ...base } as Parameters<typeof calculateQuote>[0]);
  const b = calculateQuote({ ...base } as Parameters<typeof calculateQuote>[0]);
  const c = calculateQuote({
    ...base,
    containers: [{ equipment: "DRY20", quantity: 3, weightKg: 36_001 }],
  } as Parameters<typeof calculateQuote>[0]);
  assert.equal(a.quoteId, b.quoteId);
  assert.notEqual(a.quoteId, c.quoteId);
});

test("overweight is per box, not per row: 3 x 20' at 75 t is overweight, at 60 t is not", () => {
  const heavy = calculateQuote({
    ...base,
    containers: [{ equipment: "DRY20", quantity: 3, weightKg: 75_000 }],
  } as Parameters<typeof calculateQuote>[0]);
  const light = calculateQuote({
    ...base,
    containers: [{ equipment: "DRY20", quantity: 3, weightKg: 60_000 }],
  } as Parameters<typeof calculateQuote>[0]);
  assert.equal(heavy.rows[0].overweight, true);
  assert.equal(light.rows[0].overweight, false);
});

test("validation: the errors a customer can make on the real form", () => {
  assert.deepEqual(validateQuote({ ...base, pod: "JPYOK" }).pod, { key: "quote.error.samePort" });
  assert.deepEqual(validateQuote({ ...base, containers: [] }).containers, { key: "quote.error.noContainers" });
  assert.equal(
    validateQuote({ ...base, containers: [{ equipment: "DRY20", quantity: 1, weightKg: 30_000 }] })
      .containers?.key,
    "quote.error.overPayload",
  );
  assert.equal(
    validateQuote({ ...base, commodity: "FROZEN_FOOD" }).commodity?.key,
    "quote.error.needsReefer",
  );
  assert.equal(
    validateQuote({ ...base, commodity: "FROZEN_FOOD", containers: [{ equipment: "REEFER20", quantity: 1, weightKg: 10_000 }] })
      .commodity,
    undefined,
  );
  assert.deepEqual(validateQuote({ ...base, etdOffset: null }).etd, { key: "quote.error.etd" });
  assert.deepEqual(validateQuote(base), {});
});

test("lanes are symmetric and an empty row is a shippable default", () => {
  assert.equal(laneBaseUsd("SGSIN", "JPYOK"), laneBaseUsd("JPYOK", "SGSIN"));
  const row = emptyRow();
  assert.ok(row.weightKg / row.quantity <= EQUIPMENT[row.equipment].maxPayloadKg);
});
