import assert from "node:assert/strict";
import { test } from "node:test";
import {
  arrowD,
  edgeGeometry,
  edgePoints,
  polylineLength,
  routeGeometry,
  terminalDirection,
  type Rect,
} from "./routeGeometry.ts";

const rect = (x: number, y: number, w = 100, h = 40): Rect => ({ x, y, w, h });

test("side-by-side boxes on the same row connect with a straight run", () => {
  const pts = edgePoints(rect(0, 0), rect(200, 0));
  assert.deepEqual(pts, [
    { x: 100, y: 20 },
    { x: 200, y: 20 },
  ]);
  assert.equal(terminalDirection(pts!), "right");
});

test("boxes on different rows step through the mid-gutter", () => {
  const pts = edgePoints(rect(0, 0), rect(200, 100))!;
  assert.equal(pts.length, 4);
  assert.equal(pts[0].x, 100);
  assert.equal(pts[1].x, pts[2].x, "vertical step happens at one x");
  assert.equal(pts[1].x, 150, "and that x is the mid-gutter");
  assert.equal(pts[3].x, 200);
  assert.equal(terminalDirection(pts), "right");
});

test("boxes in the same column connect vertically, pointing down", () => {
  const pts = edgePoints(rect(0, 0), rect(0, 120))!;
  assert.deepEqual(pts, [
    { x: 50, y: 40 },
    { x: 50, y: 120 },
  ]);
  assert.equal(terminalDirection(pts), "down");
});

test("an impossible edge yields null rather than a backwards line", () => {
  assert.equal(edgePoints(rect(400, 0), rect(0, 0)), null);
  assert.equal(edgePoints(rect(0, 200), rect(0, 0)), null);
});

test("a route renders as ONE continuous path with no gaps at node boundaries", () => {
  const rects: Record<string, Rect> = {
    a: rect(0, 0),
    b: rect(200, 0),
    c: rect(400, 0),
  };
  const r = routeGeometry(["a", "b", "c"], rects)!;
  assert.ok(r.d.startsWith("M 100 20"));
  // Exactly one moveto: the line is continuous through node b.
  assert.equal((r.d.match(/M /g) ?? []).length, 1);
  assert.equal(r.arrows.length, 2);
  assert.ok(r.length > 0);
});

test("a route with a missing rect is null, never half-drawn", () => {
  assert.equal(routeGeometry(["a", "missing"], { a: rect(0, 0) }), null);
  assert.equal(routeGeometry(["a"], { a: rect(0, 0) }), null);
});

test("polyline length is analytic", () => {
  assert.equal(
    polylineLength([
      { x: 0, y: 0 },
      { x: 30, y: 0 },
      { x: 30, y: 40 },
    ]),
    70,
  );
});

test("arrowheads are closed triangles pointing the right way", () => {
  const right = arrowD({ at: { x: 100, y: 50 }, dir: "right" });
  assert.ok(right.startsWith("M 100 50"));
  assert.ok(right.endsWith("Z"));
  assert.ok(right.includes("L 92"), "tail sits behind the tip");

  const down = arrowD({ at: { x: 100, y: 50 }, dir: "down" });
  assert.ok(down.includes("42"), "tail sits above the tip");
});

test("edgeGeometry skips edges whose endpoints are unmeasured", () => {
  const out = edgeGeometry(
    [
      { from: "a", to: "b" },
      { from: "a", to: "ghost" },
    ],
    { a: rect(0, 0), b: rect(200, 0) },
  );
  assert.equal(out.length, 1);
  assert.equal(out[0].key, "a->b");
});
