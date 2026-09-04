"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  NEIGHBOUR_EDGES,
  NODES,
  ROUTE_BY_NODE,
  SPINE,
  SPINE_EDGES,
  STAGES,
} from "@/lib/flow-data";
import type { ComponentId, NodeId } from "@/types/flow";
import { ComponentDetailCard } from "./ComponentDetailCard";
import { DeepDiveIndex } from "./DeepDiveIndex";
import { FlowConnectors } from "./FlowConnectors";
import { FlowLegend } from "./FlowLegend";
import { NodeBrief } from "./NodeBrief";
import { PlatformNote } from "./PlatformNote";
import { RouteReadout } from "./RouteReadout";
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

export function FlowExplorer() {
  const [selected, setSelected] = useState<NodeId | null>(null);
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
      n && isNodeId(n) ? n : c && LEGACY_C_TO_NODE[c] ? LEGACY_C_TO_NODE[c] : null;
    if (!resolved) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelected(resolved);
    setFocusNode(resolved);
  }, []);

  const select = useCallback((id: NodeId | null) => {
    setSelected(id);
    if (id) setFocusNode(id);
    const url = new URL(window.location.href);
    url.searchParams.delete("c");
    if (id) url.searchParams.set("n", id);
    else url.searchParams.delete("n");
    // replaceState, not router.push — no RSC round-trip per click, and Back
    // leaves the page instead of walking every selection.
    window.history.replaceState(null, "", url);
  }, []);

  const route = useMemo<readonly NodeId[]>(
    () => (selected ? ROUTE_BY_NODE[selected] : SPINE),
    [selected],
  );

  const peekEdges = useMemo(
    () => (peek ? NEIGHBOUR_EDGES[peek] : []),
    [peek],
  );

  /**
   * Roving tabindex: one tab stop for the whole map, arrows to move, Enter or
   * Space to commit. Movement alone must not churn the detail panel, or a
   * screen-reader user cannot explore.
   */
  const onKeyDown = (event: React.KeyboardEvent) => {
    const key = event.key;
    if (
      !["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Home", "End"].includes(
        key,
      )
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
    if (key === "ArrowDown") next = column[Math.min(rowIndex + 1, column.length - 1)];
    else if (key === "ArrowUp") next = column[Math.max(rowIndex - 1, 0)];
    else if (key === "Home") next = column[0];
    else if (key === "End") next = column[column.length - 1];
    else {
      const dir = key === "ArrowRight" ? 1 : -1;
      const target = STAGES[Math.min(Math.max(colIndex + dir, 0), STAGES.length - 1)];
      const targetCol = target.nodes as NodeId[];
      // Columns hold 3/3/6/3 nodes, so clamp to the nearest row rather than wrap.
      next = targetCol[Math.min(rowIndex, targetCol.length - 1)];
    }

    setFocusNode(next);
    gridRef.current
      ?.querySelector<HTMLButtonElement>(`[data-node="${next}"]`)
      ?.focus();
  };

  const detailComponent: ComponentId | null = selected
    ? (NODES[selected].componentId ?? null)
    : null;

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
          className="grid gap-6 lg:grid-cols-4"
        >
          {STAGES.map((stage) => (
            <StageColumn
              key={stage.id}
              stage={stage}
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

      <RouteReadout route={route} selected={selected} onSelect={select} />

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <div className="lg:w-72 lg:shrink-0">
          <FlowLegend />
        </div>
        <div className="min-w-0 flex-1">
          <DeepDiveIndex onSelect={select} />
        </div>
      </div>

      {selected && detailComponent ? (
        <ComponentDetailCard id={detailComponent} />
      ) : selected ? (
        <NodeBrief id={selected} onOpenDeepDive={select} />
      ) : (
        <div className="border border-border bg-studio p-6 rounded-sharp">
          <p className="max-w-[80ch] type-caption">
            The crimson line is the route a request takes. Select any box to
            re-route it and read what that component is, when it earns its
            place, and how it is configured. Hovering a box shows only what it
            connects to directly.
          </p>
        </div>
      )}

      <PlatformNote />

      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>
    </div>
  );
}
