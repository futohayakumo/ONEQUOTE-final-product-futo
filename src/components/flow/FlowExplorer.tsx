"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { COMPONENT_CATALOG } from "@/lib/component-catalog";
import {
  DEFAULT_PATH,
  PRIMARY_PATH_BY_COMPONENT,
  STAGES,
  pathEdgeKeys,
} from "@/lib/flow-data";
import type { ComponentId, NodeId } from "@/types/flow";
import { ComponentDetailCard } from "./ComponentDetailCard";
import { ComponentPicker } from "./ComponentPicker";
import { FlowConnectors } from "./FlowConnectors";
import { FlowLegend } from "./FlowLegend";
import { PlatformNote } from "./PlatformNote";
import { StageColumn } from "./StageColumn";
import { useNodeGeometry } from "./useNodeGeometry";

function isComponentId(v: string): v is ComponentId {
  return v in COMPONENT_CATALOG;
}

export function FlowExplorer() {
  const [selected, setSelected] = useState<ComponentId | null>(null);
  const { containerRef, registerNode, rects, size, measure } = useNodeGeometry();

  // Hydrate the selection from the URL once, after mount. Reading searchParams
  // on the server would make this route dynamic; it must stay static.
  useEffect(() => {
    // Reading the URL during render would break SSR or produce a hydration
    // mismatch, so the selection is hydrated once after mount.
    const c = new URLSearchParams(window.location.search).get("c");
    if (!c || !isComponentId(c)) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelected(c);
  }, []);

  const select = useCallback((id: ComponentId | null) => {
    setSelected(id);
    const url = new URL(window.location.href);
    if (id) url.searchParams.set("c", id);
    else url.searchParams.delete("c");
    // replaceState, not router.push — no RSC round-trip per click, and Back
    // leaves the page instead of walking every selection.
    window.history.replaceState(null, "", url);
  }, []);

  // The detail card changes the grid height, so re-measure after it renders.
  useEffect(() => {
    const id = requestAnimationFrame(measure);
    return () => cancelAnimationFrame(id);
  }, [selected, measure]);

  const path = useMemo<readonly NodeId[]>(
    () => (selected ? PRIMARY_PATH_BY_COMPONENT[selected] : DEFAULT_PATH),
    [selected],
  );

  const pathNodes = useMemo(() => new Set<NodeId>(path), [path]);
  const activeEdges = useMemo(() => pathEdgeKeys(path), [path]);
  const activeNode = selected ? COMPONENT_CATALOG[selected].nodeId : null;
  const activeStage = selected ? COMPONENT_CATALOG[selected].stage : null;

  return (
    <div className="flex flex-col gap-6">
      <div ref={containerRef} className="relative">
        <div className="grid gap-6 lg:grid-cols-4">
          {STAGES.map((stage) => (
            <StageColumn
              key={stage.id}
              stage={stage}
              activeNode={activeNode}
              pathNodes={pathNodes}
              highlighted={activeStage === stage.id}
              register={registerNode}
            />
          ))}
        </div>
        <FlowConnectors rects={rects} size={size} activeEdges={activeEdges} />
      </div>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <div className="lg:w-64 lg:shrink-0">
          <FlowLegend />
        </div>
        <div className="min-w-0 flex-1">
          <ComponentPicker selected={selected} onSelect={select} />
        </div>
      </div>

      {selected ? (
        <ComponentDetailCard id={selected} />
      ) : (
        <div className="border border-border bg-studio p-6 rounded-sharp">
          <p className="type-caption">
            The solid crimson route is the default request path. Select a
            component above to re-route it and read what that component is, when
            it earns its place, and how it is configured.
          </p>
        </div>
      )}

      <PlatformNote />
    </div>
  );
}
