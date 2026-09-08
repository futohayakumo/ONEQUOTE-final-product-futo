import assert from "node:assert/strict";
import test from "node:test";
import { buildTrace, serviceMs } from "./trace.ts";

const ROUTE = ["new-request", "request-intake", "routing-gateway", "erp-system"];
const label = (id: string) => id;

/** Parse hh:mm:ss.mmm back to milliseconds, so the assertions read the same
 *  strings the screen does rather than the internals that produced them. */
function ms(at: string): number {
  const [hh, mm, rest] = at.split(":");
  const [ss, mmm] = rest.split(".");
  return (+hh * 3600 + +mm * 60 + +ss) * 1000 + +mmm;
}

test("the printed duration equals the span of the printed timestamps", () => {
  const { log, totalMs } = buildTrace(ROUTE, label);
  // The first line is "Received request", which lands at the same instant the
  // first service is entered; the last is the closing line.
  assert.equal(ms(log.at(-1)!.at) - ms(log[0].at), totalMs);
  assert.ok(log.at(-1)!.detail!.includes(`duration=${totalMs}ms`));
});

test("end to end includes the final hop", () => {
  const { totalMs } = buildTrace(ROUTE, label);
  const work = ROUTE.reduce((n, id) => n + serviceMs(id), 0);
  assert.ok(
    totalMs >= work,
    `total ${totalMs} must cover every service, including the last (${work})`,
  );
});

test("every hop reports a distinct entry time", () => {
  const { hops } = buildTrace(ROUTE, label);
  assert.equal(new Set(hops.map((h) => h.at)).size, hops.length);
});

test("hop entry times agree with the log", () => {
  const { hops, log } = buildTrace(ROUTE, label);
  for (const hop of hops) {
    const entering = log.find((l) => l.message === `Entering ${hop.label}`);
    assert.ok(entering, `${hop.label} must appear in the log`);
    assert.equal(entering.at, hop.at);
  }
});

test("exactly one line is marked final", () => {
  const { log } = buildTrace(ROUTE, label);
  assert.equal(log.filter((l) => l.final).length, 1);
  assert.equal(log.at(-1)!.final, true);
});
