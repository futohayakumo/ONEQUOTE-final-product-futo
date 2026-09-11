"use client";

import type { FlowEdge, NodeId } from "@/types/flow";
import {
  arrowD,
  edgeGeometry,
  isColumnar,
  routeGeometry,
  type Rect,
} from "./routeGeometry";

/**
 * Three layers, never seventeen lines at once.
 *
 * 1. The spine, always on, so the left-to-right direction of the system never
 *    disappears when a route is selected.
 * 2. The selected route, drawn on top with arrowheads and a travelling pulse.
 * 3. The hovered node's direct connections, and nothing else.
 *
 * Rendering every edge permanently was the reason nobody could read this
 * diagram. Fading them was not enough: thirteen faded lines still cross.
 */
export function FlowConnectors({
  rects,
  size,
  route,
  spineEdges,
  peekEdges,
}: {
  rects: Partial<Record<NodeId, Rect>>;
  size: { w: number; h: number };
  route: readonly NodeId[];
  spineEdges: readonly FlowEdge[];
  peekEdges: readonly FlowEdge[];
}) {
  // When the grid collapses to one column every pair of boxes reads as "same
  // column", which would draw vertical spaghetti. The numbered timeline below
  // the map carries the order on narrow screens instead.
  if (!isColumnar(rects as Record<string, Rect>)) return null;

  const spine = edgeGeometry(spineEdges, rects as Record<string, Rect>);
  const peek = edgeGeometry(peekEdges, rects as Record<string, Rect>);
  const selected = routeGeometry(route, rects as Record<string, Rect>);
  const routeKeys = new Set<string>();
  for (let i = 0; i < route.length - 1; i += 1) {
    routeKeys.add(`${route[i]}->${route[i + 1]}`);
  }

  return (
    <svg
      // Must stay pointer-events-none or it swallows every node click.
      className="pointer-events-none absolute inset-0"
      width={size.w}
      height={size.h}
      aria-hidden
    >
      {spine
        .filter((e) => !routeKeys.has(e.key))
        .map((e) => (
          <g key={`spine:${e.key}`}>
            <path d={e.d} fill="none" stroke="#CBD5E1" strokeWidth={1} />
            <path d={arrowD(e.arrow)} fill="#CBD5E1" />
          </g>
        ))}

      {peek
        .filter((e) => !routeKeys.has(e.key))
        .map((e) => (
          <path
            key={`peek:${e.key}`}
            d={e.d}
            fill="none"
            stroke="#CBD5E1"
            strokeWidth={1}
            strokeDasharray="4 4"
          />
        ))}

      {selected ? (
        <g>
          <path d={selected.d} fill="none" stroke="#E1127A" strokeWidth={2} />
          {selected.arrows.map((a, i) => (
            <path key={i} d={arrowD(a)} fill="#E1127A" />
          ))}
          {/*
            One dash chasing the whole route. The SVG sits behind the nodes, so
            the pulse vanishes under each box and re-emerges — a packet moving
            through the system, at no runtime cost.
          */}
          <path
            d={selected.d}
            fill="none"
            stroke="#E1127A"
            strokeWidth={2}
            className="motion-safe:animate-route-pulse"
            style={{
              strokeDasharray: `16 ${selected.length}`,
              ["--route-span" as string]: `${selected.length + 16}px`,
            }}
          />
        </g>
      ) : null}
    </svg>
  );
}
