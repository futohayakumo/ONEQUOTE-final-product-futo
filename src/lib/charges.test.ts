import assert from "node:assert/strict";
import test from "node:test";
import {
  accountTotal,
  allInTotal,
  chargeSections,
  INCOTERMS,
  INCOTERM_ORDER,
} from "./charges.ts";

const BASE = {
  pol: "JPYOK" as const,
  pod: "SGSIN" as const,
  containerType: "20GP" as const,
  units: 3,
  oceanFreight: 3270,
};

test("every section's lines add up to its own subtotal", () => {
  for (const s of chargeSections({ ...BASE, incoterm: "DDP" })) {
    const sum = s.lines.reduce((n, l) => n + l.amount, 0);
    assert.equal(Math.round(sum * 100) / 100, s.subtotal, s.id);
  }
});

test("terminal handling is charged per container, not per volume", () => {
  const one = chargeSections({ ...BASE, units: 1, incoterm: "DDP" });
  const three = chargeSections({ ...BASE, units: 3, incoterm: "DDP" });
  const thc = (s: ReturnType<typeof chargeSections>) =>
    s[0].lines.find((l) => l.code === "THC")!.amount;
  assert.equal(thc(three), thc(one) * 3);
});

test("per-bill-of-lading charges do not scale with the box count", () => {
  const one = chargeSections({ ...BASE, units: 1, incoterm: "DDP" });
  const nine = chargeSections({ ...BASE, units: 9, incoterm: "DDP" });
  const doc = (s: ReturnType<typeof chargeSections>) =>
    s[0].lines.find((l) => l.code === "DOC")!.amount;
  assert.equal(doc(one), doc(nine));
});

test("the all-in figure does not move when the Incoterm does", () => {
  const totals = INCOTERM_ORDER.map((incoterm) =>
    allInTotal(chargeSections({ ...BASE, incoterm })),
  );
  assert.equal(new Set(totals).size, 1, "the shipment costs what it costs");
});

test("the Incoterm decides only what is on your account", () => {
  const exw = chargeSections({ ...BASE, incoterm: "EXW" });
  const fob = chargeSections({ ...BASE, incoterm: "FOB" });
  const ddp = chargeSections({ ...BASE, incoterm: "DDP" });

  assert.equal(accountTotal(exw), 0, "EXW puts nothing on the seller");
  assert.equal(accountTotal(fob), fob[0].subtotal, "FOB is origin only");
  assert.equal(accountTotal(ddp), allInTotal(ddp), "DDP is everything");
  assert.ok(accountTotal(fob) < accountTotal(ddp));
});

test("every Incoterm names sections that exist", () => {
  const ids = chargeSections({ ...BASE, incoterm: "DDP" }).map((s) => s.id);
  for (const term of INCOTERM_ORDER) {
    for (const section of INCOTERMS[term].sections) {
      assert.ok(ids.includes(section), `${term} names ${section}`);
    }
  }
});

test("BAF and CAF track the ocean freight they are charged on", () => {
  const s = chargeSections({ ...BASE, incoterm: "DDP" })[1];
  const of = s.lines.find((l) => l.code === "O/F")!.amount;
  const baf = s.lines.find((l) => l.code === "BAF")!.amount;
  const caf = s.lines.find((l) => l.code === "CAF")!.amount;
  assert.equal(baf, Math.round(of * 0.12 * 100) / 100);
  assert.equal(caf, Math.round(of * 0.025 * 100) / 100);
});
