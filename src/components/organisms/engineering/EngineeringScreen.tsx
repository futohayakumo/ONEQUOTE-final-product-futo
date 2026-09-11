"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { COMPONENT_CATALOG, COMPONENT_ORDER } from "@/lib/component-catalog";
import { NODES, ROUTE_BY_NODE, SPINE } from "@/lib/flow-data";
import { buildTrace } from "@/lib/trace";
import type { NodeId } from "@/types/flow";
import { SystemMap } from "./flow/SystemMap";
import { C4View } from "./C4View";
import { CategoryRail } from "../../molecules/CategoryRail";
import { RequestTrace } from "./RequestTrace";
import { ServiceDetail } from "./ServiceDetail";
import { ViewTabs, type EngView } from "../../molecules/ViewTabs";

/**
 * Owns the one piece of state four panels have to agree on.
 *
 * The URL is synced with replaceState rather than router.push: a push per
 * click would cost an RSC round trip each time and leave Back walking twelve
 * selections instead of leaving the page. Reading it on the server would make
 * the route dynamic, and all five routes have to stay static.
 */
/** Old ?c= links pointed at components. Derived, not restated: the same seven
 *  pairs already live in COMPONENT_CATALOG. */
const LEGACY_C_TO_NODE: Record<string, NodeId> = Object.fromEntries(
  COMPONENT_ORDER.map((id) => [id, COMPONENT_CATALOG[id].nodeId]),
);

export function EngineeringScreen() {
  const [view, setView] = useState<EngView>("map");
  // Opens on the service the rest of the site keeps pointing at, rather than
  // on a 22px heading that announces absence. A portfolio's default state
  // should be its most interesting one.
  const [selected, setSelected] = useState<NodeId | null>("quotation-service");

  const select = useCallback((id: NodeId | null) => {
    setSelected(id);
  }, []);

  // Read the deep link HERE, where it is also written. It used to be read in
  // SystemMap and written here, and worked only because child effects flush
  // before parent ones — so the child's read landed before the parent's first
  // pass wiped the query string. Hoist that component, wrap it in Suspense or
  // lazy-import it and /engineering?n=analytics would silently open on the
  // default route with the parameter stripped.
  // A ref, not state: this only gates the writer effect, so re-rendering for
  // it would be a render nobody watches.
  const hydrated = useRef(false);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const n = params.get("n");
    const c = params.get("c");
    const resolved =
      n && n in NODES ? (n as NodeId) : c ? (LEGACY_C_TO_NODE[c] ?? null) : null;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (resolved) setSelected(resolved);
    hydrated.current = true;
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    const url = new URL(window.location.href);
    url.searchParams.delete("c");
    if (selected) url.searchParams.set("n", selected);
    else url.searchParams.delete("n");
    window.history.replaceState(null, "", url);
  }, [selected]);

  const route = useMemo<readonly NodeId[]>(
    () => (selected ? ROUTE_BY_NODE[selected] : SPINE),
    [selected],
  );

  // One walk, two consumers. The timeline and the log used to compute their
  // own clocks and disagreed with each other by 600ms.
  const trace = useMemo(
    () => buildTrace(route, (id) => NODES[id as NodeId].label),
    [route],
  );

  return (
    <div className="flex flex-col gap-14">
      <ViewTabs view={view} onChange={setView} />

      {/*
        Both panels stay mounted and one is hidden, rather than being swapped.
        The map measures its own nodes to draw the connectors; unmounting it
        throws that measurement away, and the diagram redraws from zero every
        time the reader looks at the C4 view and comes back.
      */}
      <div
        role="tabpanel"
        id="engpanel-map"
        aria-labelledby="engtab-map"
        hidden={view !== "map"}
        className="flex flex-col gap-14"
      >
        <div className="grid gap-10 lg:grid-cols-[minmax(0,13rem)_minmax(0,1fr)]">
          <CategoryRail selected={selected} onSelect={select} />
          <div className="min-w-0">
            <SystemMap selected={selected} route={route} onSelect={select} />
          </div>
        </div>

        <hr className="border-border" />
        <RequestTrace trace={trace} />
        <hr className="border-border" />
        <ServiceDetail selected={selected} route={route} trace={trace} />
      </div>

      <div
        role="tabpanel"
        id="engpanel-c4"
        aria-labelledby="engtab-c4"
        hidden={view !== "c4"}
      >
        {/* Mounted only once opened: mermaid is ~500 kB, and a reader who
            never opens this tab should never download it. */}
        {view === "c4" ? <C4View /> : null}
      </div>
    </div>
  );
}
