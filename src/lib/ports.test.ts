import assert from "node:assert/strict";
import { test } from "node:test";
import {
  COUNTRY_ORDER,
  PORTS,
  PORTS_META,
  greatCircleNm,
  laneBaseFromNm,
  portByCode,
  portsIn,
  seaDistanceNm,
  transitDaysFromNm,
} from "./ports.ts";

const at = (code: string) => {
  const p = portByCode(code);
  assert.ok(p, `${code} is in the snapshot`);
  return p;
};

test("the snapshot is every placed seaport, and says how many it could not place", () => {
  assert.equal(PORTS.length, PORTS_META.withCoordinates);
  assert.ok(PORTS_META.seaports > PORTS.length, "some ports carry no coordinates, and the count says so");
  assert.equal(new Set(PORTS.map((p) => p.code)).size, PORTS.length, "codes are unique");
  for (const p of PORTS) {
    assert.match(p.code, /^[A-Z]{2}[A-Z2-9]{3}$/);
    assert.ok(Math.abs(p.lat) <= 90 && Math.abs(p.lon) <= 180);
    assert.ok(COUNTRY_ORDER.includes(p.country as (typeof COUNTRY_ORDER)[number]));
  }
  for (const c of COUNTRY_ORDER) assert.ok(portsIn(c).length > 0, `${c} has placed ports`);
});

test("the four ports the site used to hard-code are still there", () => {
  for (const c of ["JPTYO", "JPYOK", "SGSIN", "NLRTM"]) at(c);
});

test("the great circle is the wrong sea distance, and the chokepoints fix it", () => {
  const tyo = at("JPTYO");
  const rtm = at("NLRTM");
  const crow = greatCircleNm(tyo, rtm);
  const sea = seaDistanceNm(tyo, rtm);
  assert.ok(crow > 4_500 && crow < 5_500, `crow ${crow}`);
  // About 11,000 nm by Suez, which is what the trade quotes.
  assert.ok(sea > 10_500 && sea < 11_500, `sea ${sea}`);
});

test("sea distance is symmetric, zero on itself, and direct inside a region", () => {
  const tyo = at("JPTYO");
  const sin = at("SGSIN");
  const yok = at("JPYOK");
  assert.equal(seaDistanceNm(tyo, sin), seaDistanceNm(sin, tyo));
  assert.equal(seaDistanceNm(tyo, tyo), 0);
  assert.equal(seaDistanceNm(tyo, yok), Math.round(greatCircleNm(tyo, yok)));
  // Tokyo–Singapore is roughly a straight run; Singapore–Rotterdam about 8,300.
  assert.ok(seaDistanceNm(tyo, sin) > 2_700 && seaDistanceNm(tyo, sin) < 3_100);
  assert.ok(seaDistanceNm(sin, at("NLRTM")) > 7_800 && seaDistanceNm(sin, at("NLRTM")) < 8_600);
});

test("the lane figures are a line in the distance, fitted to the old table", () => {
  // The six lanes the site used to carry by hand land within 5% of their
  // old figures, so last week's numbers survive on those lanes.
  const old: [string, string, number][] = [
    ["JPTYO", "SGSIN", 1150],
    ["JPTYO", "NLRTM", 2480],
    ["SGSIN", "NLRTM", 1980],
  ];
  for (const [a, b, usd] of old) {
    const now = laneBaseFromNm(seaDistanceNm(at(a), at(b)));
    assert.ok(Math.abs(now - usd) / usd < 0.05, `${a}–${b}: ${now} vs ${usd}`);
  }
  assert.equal(transitDaysFromNm(0), 1);
  assert.equal(transitDaysFromNm(360), 2);
  assert.ok(transitDaysFromNm(seaDistanceNm(at("JPTYO"), at("NLRTM"))) >= 30);
});
