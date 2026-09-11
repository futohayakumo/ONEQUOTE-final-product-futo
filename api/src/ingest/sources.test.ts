import assert from "node:assert/strict";
import { test } from "node:test";
import { fetchEcbRates, parseCoordinates, parseUnlocode, splitCsvLine } from "./sources.ts";

test("ECB rates come back keyed base/quote with the source's own date", async () => {
  const fake = (async () =>
    new Response(
      JSON.stringify({ amount: 1, base: "USD", date: "2026-09-10", rates: { JPY: 154.18, EUR: 0.86088 } }),
      { status: 200 },
    )) as unknown as typeof fetch;
  const rates = await fetchEcbRates(fake);
  assert.deepEqual(
    rates.map((r) => [r.key, r.value, r.asOf.toISOString().slice(0, 10)]),
    [["USD/JPY", 154.18, "2026-09-10"], ["USD/EUR", 0.86088, "2026-09-10"]],
  );
  assert.ok(rates.every((r) => r.source === "ecb" && r.url.startsWith("https://")));
});

test("UN/LOCODE coordinates parse from degrees-and-minutes, and absence stays null", () => {
  assert.deepEqual(parseCoordinates("3527N 13946E"), [35.45, 139.7667]);
  assert.deepEqual(parseCoordinates("0116N 10345E"), [1.2667, 103.75]);
  assert.equal(parseCoordinates(""), null);
});

test("only seaports in the routed countries are kept", () => {
  const csv = [
    "Change,Country,Location,Name,NameWoDiacritics,Subdivision,Status,Function,Date,IATA,Coordinates,Remarks",
    ",JP,YOK,Yokohama,Yokohama,14,AF,1234----,0207,,3527N 13946E,",
    ",JP,TYO,Tokyo,Tokyo,13,AF,1234----,0207,,3541N 13946E,",
    ",JP,NRT,Narita,Narita,12,AI,--34----,0207,NRT,3546N 14023E,",
    ",FR,PAR,Paris,Paris,75,AI,-2345---,0207,,4851N 00220E,",
    ',SG,SIN,"Singapore, Port of",Singapore,,AI,1--45---,0601,SIN,0116N 10345E,',
  ].join("\n");
  const ports = parseUnlocode(csv);
  assert.deepEqual(
    ports.map((p) => p.unlocode),
    ["JPYOK", "JPTYO", "SGSIN"],
  );
  assert.equal(ports[2].name, "Singapore");
});

test("a quoted field with a comma survives the splitter", () => {
  assert.deepEqual(splitCsvLine('a,"b, c",d'), ["a", "b, c", "d"]);
});
