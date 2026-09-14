import assert from "node:assert/strict";
import { test } from "node:test";
import { RatesService } from "./rates.service.ts";

/**
 * The service is exercised with a fake table and a fake network, because
 * what it promises is a rule, not a number: the ECB's answer when there is
 * one, the stored answer labelled `cached` when there is not, and the table
 * refreshed by every live fetch.
 */
function fakePrisma(seed: Record<string, { value: number; asOf: Date; fetchedAt: Date }>) {
  const table = new Map(Object.entries(seed));
  return {
    rate: {
      async upsert({ where, create }: { where: { source_key: { key: string } }; create: { value: number; asOf: Date; fetchedAt: Date; url: string; source: string } }) {
        const row = { id: 1, source: create.source, key: where.source_key.key, value: create.value, asOf: create.asOf, fetchedAt: create.fetchedAt, url: create.url };
        table.set(row.key, row);
        return row;
      },
      async findMany() {
        return [...table.entries()].map(([key, r]) => ({ id: 1, source: "ecb", key, url: "", ...r }));
      },
    },
    table,
  };
}

const ok = (rates: Record<string, number>, date = "2026-09-11") =>
  (async () => ({ ok: true, json: async () => ({ base: "USD", date, rates }) })) as unknown as typeof fetch;

test("a live answer is served and stored", async () => {
  const prisma = fakePrisma({});
  const svc = new RatesService(prisma as never);
  globalThis.fetch = ok({ JPY: 154.04 });
  const out = await svc.current();
  assert.equal(out.mode, "live");
  assert.equal(out.rates[0].value, 154.04);
  assert.equal(prisma.table.get("USD/JPY")?.value, 154.04);
});

test("no answer serves the stored rate, says cached, and says why", async () => {
  const stored = new Date("2026-09-11T09:00:00Z");
  const prisma = fakePrisma({ "USD/JPY": { value: 154.18, asOf: new Date("2026-09-10T00:00:00Z"), fetchedAt: stored } });
  const svc = new RatesService(prisma as never);
  globalThis.fetch = (async () => {
    throw new Error("TimeoutError");
  }) as unknown as typeof fetch;
  const out = await svc.current();
  assert.equal(out.mode, "cached");
  assert.match(out.reason ?? "", /Timeout/);
  assert.equal(out.rates[0].value, 154.18);
  assert.equal(out.rates[0].fetchedAt, stored);
});

test("an HTTP error is a miss, not a rate", async () => {
  const prisma = fakePrisma({});
  const svc = new RatesService(prisma as never);
  globalThis.fetch = (async () => ({ ok: false, status: 503 })) as unknown as typeof fetch;
  const out = await svc.current();
  assert.equal(out.mode, "cached");
  assert.equal(out.rates.length, 0);
});
