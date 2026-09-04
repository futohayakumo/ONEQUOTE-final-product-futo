/**
 * Pure geometry for the flow map. No runtime imports, so the node test runner
 * can execute it directly — the same discipline as processModel.ts.
 *
 * Orthogonal polylines only: horizontal and vertical segments, never a curve.
 * That restraint IS the hard-edged aesthetic, and it also makes the geometry
 * predictable enough to unit test.
 */

export interface Pt {
  x: number;
  y: number;
}

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export type ArrowDir = "right" | "down" | "up";

export interface Arrow {
  at: Pt;
  dir: ArrowDir;
}

const SAME_COLUMN_TOLERANCE = 4;
const ALIGNED_ROW_TOLERANCE = 3;

/**
 * The points of the connector between two node boxes.
 *
 * Cross-column: exit the right edge, run to the mid-gutter, step vertically,
 * enter the left edge. Same column: bottom edge to top edge.
 */
export function edgePoints(from: Rect, to: Rect): Pt[] | null {
  const sameColumn = Math.abs(from.x - to.x) < SAME_COLUMN_TOLERANCE;

  if (sameColumn) {
    const x = Math.round(from.x + from.w / 2);
    const y1 = Math.round(from.y + from.h);
    const y2 = Math.round(to.y);
    if (y2 <= y1) return null;
    return [
      { x, y: y1 },
      { x, y: y2 },
    ];
  }

  const x1 = Math.round(from.x + from.w);
  const y1 = Math.round(from.y + from.h / 2);
  const x2 = Math.round(to.x);
  const y2 = Math.round(to.y + to.h / 2);
  if (x2 <= x1) return null;

  if (Math.abs(y1 - y2) < ALIGNED_ROW_TOLERANCE) {
    return [
      { x: x1, y: y1 },
      { x: x2, y: y1 },
    ];
  }

  const mid = Math.round(x1 + (x2 - x1) / 2);
  return [
    { x: x1, y: y1 },
    { x: mid, y: y1 },
    { x: mid, y: y2 },
    { x: x2, y: y2 },
  ];
}

export function polylineD(points: readonly Pt[]): string {
  if (points.length === 0) return "";
  return points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
}

/** Analytic length — never reads the DOM, so it is safe during render. */
export function polylineLength(points: readonly Pt[]): number {
  let total = 0;
  for (let i = 1; i < points.length; i += 1) {
    total += Math.hypot(
      points[i].x - points[i - 1].x,
      points[i].y - points[i - 1].y,
    );
  }
  return total;
}

/** Direction of travel entering the final point of a polyline. */
export function terminalDirection(points: readonly Pt[]): ArrowDir {
  if (points.length < 2) return "right";
  const a = points[points.length - 2];
  const b = points[points.length - 1];
  if (Math.abs(b.x - a.x) >= Math.abs(b.y - a.y)) return "right";
  return b.y > a.y ? "down" : "up";
}

/**
 * A filled triangle, drawn as a path rather than an SVG <marker>. Markers drag
 * in a <defs> block, markerUnits scaling, and their own join rules; an explicit
 * path keeps the miter joins that match every icon in the app.
 */
export function arrowD(arrow: Arrow, size = 8): string {
  const { at, dir } = arrow;
  const half = size * 0.375;
  if (dir === "right") {
    return `M ${at.x} ${at.y} L ${at.x - size} ${at.y - half} L ${at.x - size} ${at.y + half} Z`;
  }
  if (dir === "down") {
    return `M ${at.x} ${at.y} L ${at.x - half} ${at.y - size} L ${at.x + half} ${at.y - size} Z`;
  }
  return `M ${at.x} ${at.y} L ${at.x - half} ${at.y + size} L ${at.x + half} ${at.y + size} Z`;
}

export interface EdgeRender {
  key: string;
  d: string;
  arrow: Arrow;
}

export function edgeGeometry<T extends { from: string; to: string }>(
  edges: readonly T[],
  rects: Record<string, Rect | undefined>,
): EdgeRender[] {
  const out: EdgeRender[] = [];
  for (const edge of edges) {
    const from = rects[edge.from];
    const to = rects[edge.to];
    if (!from || !to) continue;
    const pts = edgePoints(from, to);
    if (!pts) continue;
    out.push({
      key: `${edge.from}->${edge.to}`,
      d: polylineD(pts),
      arrow: { at: pts[pts.length - 1], dir: terminalDirection(pts) },
    });
  }
  return out;
}

export interface RouteRender {
  d: string;
  length: number;
  arrows: Arrow[];
}

/**
 * ONE continuous polyline for the whole route, not one path per hop.
 *
 * Each intermediate node's exit anchor is joined to the next hop's entry
 * anchor, so the line passes THROUGH the node box. Because the SVG sits behind
 * the nodes, the travelling pulse disappears under each node and re-emerges —
 * which is the packet-through-a-system metaphor, for free.
 */
export function routeGeometry(
  route: readonly string[],
  rects: Record<string, Rect | undefined>,
): RouteRender | null {
  if (route.length < 2) return null;

  const points: Pt[] = [];
  const arrows: Arrow[] = [];

  for (let i = 0; i < route.length - 1; i += 1) {
    const from = rects[route[i]];
    const to = rects[route[i + 1]];
    if (!from || !to) return null;
    const pts = edgePoints(from, to);
    if (!pts) return null;

    if (points.length > 0) {
      // Bridge across the node box we just landed in.
      points.push(pts[0]);
    }
    points.push(...pts);
    arrows.push({ at: pts[pts.length - 1], dir: terminalDirection(pts) });
  }

  return {
    d: polylineD(points),
    length: polylineLength(points),
    arrows,
  };
}
