"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { NodeId } from "@/types/flow";
import type { Rect } from "./routeGeometry";

export type { Rect } from "./routeGeometry";

/**
 * Measures every registered node relative to the grid container.
 *
 * Measurement races font loading: on first paint getBoundingClientRect returns
 * pre-swap geometry and connectors land several pixels off. So we re-measure on
 * three signals — ResizeObserver on the container, document.fonts.ready, and
 * window resize — rather than trusting a single layout pass.
 */
export function useNodeGeometry() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const nodeRefs = useRef(new Map<NodeId, HTMLElement>());
  const [rects, setRects] = useState<Partial<Record<NodeId, Rect>>>({});
  const [size, setSize] = useState({ w: 0, h: 0 });

  const registerNode = useCallback((id: NodeId, el: HTMLElement | null) => {
    if (el) nodeRefs.current.set(id, el);
    else nodeRefs.current.delete(id);
  }, []);

  const measure = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const base = container.getBoundingClientRect();
    const next: Partial<Record<NodeId, Rect>> = {};
    nodeRefs.current.forEach((el, id) => {
      const r = el.getBoundingClientRect();
      next[id] = {
        x: r.left - base.left,
        y: r.top - base.top,
        w: r.width,
        h: r.height,
      };
    });
    setRects(next);
    setSize({ w: base.width, h: base.height });
  }, []);

  useEffect(() => {
    measure();

    const container = containerRef.current;
    const ro = new ResizeObserver(measure);
    if (container) ro.observe(container);
    nodeRefs.current.forEach((el) => ro.observe(el));

    window.addEventListener("resize", measure);
    // Fonts swap after first paint and change every node's height.
    document.fonts?.ready.then(measure).catch(() => {});

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [measure]);

  return { containerRef, registerNode, rects, size, measure };
}
