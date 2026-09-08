import assert from "node:assert/strict";
import test from "node:test";
import { calculateQuote, CONTAINERS } from "./pricing.ts";
import { quoteForSailing, sailingsFor } from "./sailings.ts";

/**
 * The list and the breakdown render the same total from the same function.
 * This test is the reason that function exists: before it, each computed the
 * number its own way and they agreed only by luck.
 */
test("every sailing prices identically wherever it is rendered", () => {
  const quote = calculateQuote({
    pol: "JPYOK",
    pod: "SGSIN",
    cbm: 90,
    containerType: "20GP",
    tier: "SILVER_SAIL",
  });
  const args = {
    ...quote,
    containerLabel: CONTAINERS[quote.containerType].label,
  };

  for (const sailing of sailingsFor("JPYOK", "SGSIN")) {
    const priced = quoteForSailing(args, sailing);
    const sum = priced.lines.reduce((n, l) => n + l.amount, 0);
    assert.equal(
      Math.round(sum * 100) / 100,
      priced.subtotal,
      `${sailing.id}: lines must add up to the subtotal`,
    );
    assert.equal(
      Math.round((priced.subtotal - priced.discount) * 100) / 100,
      priced.total,
      `${sailing.id}: subtotal minus discount must be the total`,
    );
  }
});

test("the recommended sailing costs what the base quote costs", () => {
  const quote = calculateQuote({
    pol: "JPYOK",
    pod: "SGSIN",
    cbm: 90,
    containerType: "20GP",
    tier: "SILVER_SAIL",
  });
  const recommended = sailingsFor("JPYOK", "SGSIN").find((s) => s.recommended)!;
  assert.equal(recommended.rateFactor, 1);
  const priced = quoteForSailing(
    { ...quote, containerLabel: CONTAINERS[quote.containerType].label },
    recommended,
  );
  assert.equal(priced.total, quote.total);
});

test("a cheaper sailing is cheaper and a faster one is dearer", () => {
  const quote = calculateQuote({
    pol: "JPYOK",
    pod: "SGSIN",
    cbm: 90,
    containerType: "20GP",
    tier: "SILVER_SAIL",
  });
  const args = {
    ...quote,
    containerLabel: CONTAINERS[quote.containerType].label,
  };
  const [direct, transship, express] = sailingsFor("JPYOK", "SGSIN");
  assert.ok(
    quoteForSailing(args, transship).total < quoteForSailing(args, direct).total,
  );
  assert.ok(
    quoteForSailing(args, express).total > quoteForSailing(args, direct).total,
  );
  assert.ok(transship.transitDays > direct.transitDays);
  assert.ok(express.transitDays < direct.transitDays);
});
