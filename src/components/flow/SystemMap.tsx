"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import {
  NEIGHBOUR_EDGES,
  NODES,
  SPINE_EDGES,
  STAGES,
} from "@/lib/flow-data";
import type { NodeId } from "@/types/flow";
import { FlowConnectors } from "./FlowConnectors";
import { isColumnar } from "./routeGeometry";
import { FlowLegend } from "./FlowLegend";
import { StageColumn } from "./StageColumn";
import { useNodeGeometry } from "./useNodeGeometry";

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
    ? `${NODES[selected].label} selected. Route is now ${route.length} hops, ending at ${NODES[route[route.length - 1]].label}.`
    : "Selection cleared. Showing the default route.";

  return (
    <div className="flex flex-col gap-6">
      <div ref={containerRef} className="relative">
        <div
          ref={gridRef}
          role="group"
          aria-label="System flow map. Use the arrow keys to move between components, and Enter to inspect one."
          onKeyDown={onKeyDown}
          className="grid gap-y-8 sm:grid-cols-2 sm:gap-x-0 lg:grid-cols-4"
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

      {/* Describes three line styles; pointless when none are drawn. */}
      {isColumnar(rects) ? <FlowLegend /> : null}

      {/* aria-atomic so a partial update is not read as a fragment, and a
          sentence on deselect -- emptying a live region announces nothing, so
          clearing the selection used to be silent. */}
      <p aria-live="polite" aria-atomic="true" className="sr-only">
        {announcement}
      </p>
    </div>
  );
}
