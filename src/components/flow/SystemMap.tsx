"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  NEIGHBOUR_EDGES,
  NODES,
  SPINE_EDGES,
  STAGES,
} from "@/lib/flow-data";
import type { NodeId } from "@/types/flow";
import { FlowConnectors } from "./FlowConnectors";
import { FlowLegend } from "./FlowLegend";
import { StageColumn } from "./StageColumn";
import { useNodeGeometry } from "./useNodeGeometry";

function isNodeId(v: string): v is NodeId {
  return v in NODES;
}

/** The old ?c= links pointed at components; keep them working. */
const LEGACY_C_TO_NODE: Record<string, NodeId> = {
  "web-portal": "request-intake",
  "routing-gateway": "routing-gateway",
  "quotation-service": "quotation-service",
  "campaign-service": "campaign-service",
  "data-platform": "data-platform",
  "feature-flags": "feature-flags",
  "translation-api": "translation-api",
};

/**
 * The diagram itself. Selection is a prop rather than local state: the rail,
 * the timeline and the detail panel all have to agree on one selected node,
 * and the only way three siblings agree is if none of them owns it.
 */
export function SystemMap({
  selected,
  route,
  onSelect,
}: {
  selected: NodeId | null;
  route: readonly NodeId[];
  onSelect: (id: NodeId | null) => void;
}) {

  const [peek, setPeek] = useState<NodeId | null>(null);
  const [focusNode, setFocusNode] = useState<NodeId>("new-request");
  const { containerRef, registerNode, rects, size } = useNodeGeometry();
  const gridRef = useRef<HTMLDivElement>(null);

  // Hydrate from the URL once, after mount. Reading searchParams on the server
  // would make this route dynamic; it has to stay static.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const n = params.get("n");
    const c = params.get("c");
    const resolved =
      n && isNodeId(n)
        ? n
        : c && LEGACY_C_TO_NODE[c]
          ? LEGACY_C_TO_NODE[c]
          : null;
    if (!resolved) return;
    onSelect(resolved);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFocusNode(resolved);
    // Hydrating the URL is a once-on-mount job. Re-running it when the parent
    // re-creates onSelect would re-apply the query string over a live
    // selection and snap the map back on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const select = useCallback(
    (id: NodeId | null) => {
      onSelect(id);
      if (id) setFocusNode(id);
    },
    [onSelect],
  );

  const peekEdges = useMemo(() => (peek ? NEIGHBOUR_EDGES[peek] : []), [peek]);

  /**
   * Roving tabindex: one tab stop for the whole map, arrows to move, Enter or
   * Space to commit. Movement alone must not churn the detail panel, or a
   * screen-reader user cannot explore.
   */
  const onKeyDown = (event: React.KeyboardEvent) => {
    const key = event.key;
    if (
      ![
        "ArrowUp",
        "ArrowDown",
        "ArrowLeft",
        "ArrowRight",
        "Home",
        "End",
      ].includes(key)
    ) {
      return;
    }
    event.preventDefault();

    const colIndex = STAGES.findIndex((s) =>
      (s.nodes as NodeId[]).includes(focusNode),
    );
    if (colIndex === -1) return;
    const column = STAGES[colIndex].nodes as NodeId[];
    const rowIndex = column.indexOf(focusNode);

    let next: NodeId = focusNode;
    if (key === "ArrowDown")
      next = column[Math.min(rowIndex + 1, column.length - 1)];
    else if (key === "ArrowUp") next = column[Math.max(rowIndex - 1, 0)];
    else if (key === "Home") next = column[0];
    else if (key === "End") next = column[column.length - 1];
    else {
      const dir = key === "ArrowRight" ? 1 : -1;
      const target =
        STAGES[Math.min(Math.max(colIndex + dir, 0), STAGES.length - 1)];
      const targetCol = target.nodes as NodeId[];
      // Columns hold 3/3/6/3 nodes, so clamp to the nearest row rather than wrap.
      next = targetCol[Math.min(rowIndex, targetCol.length - 1)];
    }

    setFocusNode(next);
    gridRef.current
      ?.querySelector<HTMLButtonElement>(`[data-node="${next}"]`)
      ?.focus();
  };

  const announcement = selected
    ? `${NODES[selected].label} selected. Route, ${route.length} hops: ${route
        .map((id) => NODES[id].label)
        .join(", ")}.`
    : "";

  return (
    <div className="flex flex-col gap-6">
      <div ref={containerRef} className="relative">
        <div
          ref={gridRef}
          role="group"
          aria-label="System flow map. Use the arrow keys to move between components, and Enter to inspect one."
          onKeyDown={onKeyDown}
          className="grid gap-y-8 lg:grid-cols-4 lg:gap-x-0"
        >
          {STAGES.map((stage, index) => (
            <StageColumn
              key={stage.id}
              stage={stage}
              index={index}
              selected={selected}
              route={route}
              focusNode={focusNode}
              register={registerNode}
              onSelect={(id) => select(id === selected ? null : id)}
              onPeek={setPeek}
              onPeekEnd={() => setPeek(null)}
            />
          ))}
        </div>
        <FlowConnectors
          rects={rects}
          size={size}
          route={route}
          spineEdges={SPINE_EDGES}
          peekEdges={peekEdges}
        />
      </div>

      <FlowLegend />

      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>
    </div>
  );
}
