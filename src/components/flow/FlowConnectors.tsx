"use client";

import { EDGES, edgeKey } from "@/lib/flow-data";
import { NODES } from "@/lib/flow-data";
import type { NodeId } from "@/types/flow";
import type { Rect } from "./useNodeGeometry";

/**
 * Orthogonal polylines only — horizontal and vertical segments, never a curve.
 * That restraint IS the hard-edged aesthetic, and it also makes the geometry
 * trivially predictable at any breakpoint.
 */
function orthogonalPath(from: Rect, to: Rect): string | null {
  const sameColumn = Math.abs(from.x - to.x) < 4;

  if (sameColumn) {
    // Vertical hop within a stage column: bottom edge to top edge.
    const x = Math.round(from.x + from.w / 2);
    const y1 = Math.round(from.y + from.h);
    const y2 = Math.round(to.y);
    if (y2 <= y1) return null;
    return `M ${x} ${y1} L ${x} ${y2}`;
  }

  // Cross-column: exit right, run to the mid-gutter, step vertically, enter left.
  const x1 = Math.round(from.x + from.w);
  const y1 = Math.round(from.y + from.h / 2);
  const x2 = Math.round(to.x);
  const y2 = Math.round(to.y + to.h / 2);
  if (x2 <= x1) return null;
  const mid = Math.round(x1 + (x2 - x1) / 2);

  if (Math.abs(y1 - y2) < 3) return `M ${x1} ${y1} L ${x2} ${y1}`;
  return `M ${x1} ${y1} L ${mid} ${y1} L ${mid} ${y2} L ${x2} ${y2}`;
}

export function FlowConnectors({
  rects,
  size,
  activeEdges,
}: {
  rects: Partial<Record<NodeId, Rect>>;
  size: { w: number; h: number };
  activeEdges: Set<string>;
}) {
  if (size.w === 0) return null;

  const drawn = EDGES.map((edge) => {
    const from = rects[edge.from];
    const to = rects[edge.to];
    if (!from || !to) return null;
    const d = orthogonalPath(from, to);
    if (!d) return null;
    return { key: edgeKey(edge), d, active: activeEdges.has(edgeKey(edge)) };
  }).filter((x): x is { key: string; d: string; active: boolean } => x !== null);

  return (
    <svg
      // Must be pointer-events-none or it swallows every node click.
      className="pointer-events-none absolute inset-0"
      width={size.w}
      height={size.h}
      aria-hidden
    >
      {/* Alternative paths first, so the selected path always draws on top. */}
      {drawn
        .filter((p) => !p.active)
        .map((p) => (
          <path
            key={p.key}
            d={p.d}
            fill="none"
            stroke="#CBD5E1"
            strokeWidth={1}
            strokeDasharray="4 4"
          />
        ))}
      {drawn
        .filter((p) => p.active)
        .map((p) => (
          <path key={p.key} d={p.d} fill="none" stroke="#E1127A" strokeWidth={2} />
        ))}
    </svg>
  );
}

export const NODE_LABELS = NODES;
