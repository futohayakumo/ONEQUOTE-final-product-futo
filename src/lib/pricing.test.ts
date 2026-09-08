import assert from "node:assert/strict";
import { test } from "node:test";
import { calculateQuote, quoteRef, validateQuote } from "./pricing.ts";

/**
 * Run with:  node --test --experimental-strip-types src/lib/pricing.test.ts
 * These three lanes are the fixtures the on-screen console output is checked
 * against, so a change here is a deliberate change to the simulated pricing.
 */

test("worked example A — Tokyo to Rotterdam, 120 CBM, 40' High Cube HC, Golden Sea", () => {
  const q = calculateQuote({
    pol: "JPTYO",
    pod: "NLRTM",
    cbm: 120,
    containerType: "40HC",
    tier: "GOLDEN_SEA",
  });

  assert.equal(q.units, 2); // ceil(120 / 76)
  assert.equal(q.oceanFreight, 8680.0); // 2480 * 1.75 * 2
  assert.equal(q.terminalHandling, 540.0); // 120 * 4.50
  assert.equal(q.documentation, 65.0);
  assert.equal(q.bunkerAdjustment, 1041.6); // 12% of ocean freight
  assert.equal(q.subtotal, 10326.6);
  assert.equal(q.loyaltyDiscount, 619.6); // 6%
  assert.equal(q.total, 9707.0);
  assert.equal(q.teuAccrued, 4);
  assert.equal(q.nextMilestoneTeu, 20);
});

test("worked example B — Singapore to Rotterdam, 30 CBM, 20' Standard GP, Blue Wave", () => {
  const q = calculateQuote({
    pol: "SGSIN",
    pod: "NLRTM",
    cbm: 30,
    containerType: "20GP",
    tier: "BLUE_WAVE",
  });

  assert.equal(q.units, 1);
  assert.equal(q.oceanFreight, 1980.0);
  assert.equal(q.subtotal, 2417.6);
  // Blue Wave carries NO rate discount — its value is the milestone coupon.
  assert.equal(q.loyaltyDiscount, 0);
  assert.equal(q.total, 2417.6);
  assert.equal(q.teuAccrued, 1);
  assert.equal(q.nextMilestoneTeu, 5);
});

test("worked example C — Tokyo to Yokohama, 200 CBM, 40' Reefer RF, Platinum Tide", () => {
  const q = calculateQuote({
    pol: "JPTYO",
    pod: "JPYOK",
    cbm: 200,
    containerType: "40RF",
    tier: "PLATINUM_TIDE",
  });

  assert.equal(q.units, 3); // ceil(200 / 67) = 3, not 4
  assert.equal(q.oceanFreight, 2496.0); // 320 * 2.6 * 3
  assert.equal(q.terminalHandling, 900.0);
  assert.equal(q.bunkerAdjustment, 299.52);
  assert.equal(q.subtotal, 3760.52);
  assert.equal(q.loyaltyDiscount, 376.05); // 10%
  assert.equal(q.total, 3384.47);
  assert.equal(q.teuAccrued, 6);
  assert.equal(q.nextMilestoneTeu, 50);
});

test("lane lookup is symmetric", () => {
  const a = calculateQuote({
    pol: "JPTYO",
    pod: "NLRTM",
    cbm: 50,
    containerType: "20GP",
    tier: "BLUE_WAVE",
  });
  const b = calculateQuote({
    pol: "NLRTM",
    pod: "JPTYO",
    cbm: 50,
    containerType: "20GP",
    tier: "BLUE_WAVE",
  });
  assert.equal(a.total, b.total);
});

test("quote reference is stable and input-derived", () => {
  const args = ["JPTYO", "NLRTM", 120, "40HC", "GOLDEN_SEA"] as const;
  assert.equal(quoteRef(...args), quoteRef(...args));
  assert.notEqual(
    quoteRef(...args),
    quoteRef("JPTYO", "NLRTM", 121, "40HC", "GOLDEN_SEA"),
  );
  assert.match(quoteRef(...args), /^[0-9A-F]{6}$/);
});

test("validation rejects same port, and out-of-range volume", () => {
  assert.ok(
    validateQuote({
      pol: "JPTYO",
      pod: "JPTYO",
      cbm: 10,
      containerType: "20GP",
      tier: "BLUE_WAVE",
    }).pod,
  );
  assert.ok(
    validateQuote({
      pol: "JPTYO",
      pod: "NLRTM",
      cbm: 2001,
      containerType: "20GP",
      tier: "BLUE_WAVE",
    }).cbm,
  );
  assert.deepEqual(
    validateQuote({
      pol: "JPTYO",
      pod: "NLRTM",
      cbm: 120,
      containerType: "40HC",
      tier: "GOLDEN_SEA",
    }),
    {},
  );
});
