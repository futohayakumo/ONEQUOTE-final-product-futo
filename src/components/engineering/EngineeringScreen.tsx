"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ROUTE_BY_NODE, SPINE } from "@/lib/flow-data";
import type { NodeId } from "@/types/flow";
import { SystemMap } from "../flow/SystemMap";
import { CategoryRail } from "./CategoryRail";
import { RequestTrace } from "./RequestTrace";
import { ServiceDetail } from "./ServiceDetail";
import { ViewTabs } from "./ViewTabs";

/**
 * Owns the one piece of state four panels have to agree on.
 *
 * The URL is synced with replaceState rather than router.push: a push per
 * click would cost an RSC round trip each time and leave Back walking twelve
 * selections instead of leaving the page. Reading it on the server would make
 * the route dynamic, and all five routes have to stay static.
 */
export function EngineeringScreen() {
  const [selected, setSelected] = useState<NodeId | null>(null);

  const select = useCallback((id: NodeId | null) => {
    setSelected(id);
  }, []);

  useEffect(() => {
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

  return (
    <div className="flex flex-col gap-14">
      <ViewTabs />

      <div className="grid gap-10 lg:grid-cols-[minmax(0,13rem)_minmax(0,1fr)]">
        <CategoryRail selected={selected} onSelect={select} />
        <div className="min-w-0">
          <SystemMap selected={selected} route={route} onSelect={select} />
        </div>
      </div>

      <hr className="border-border" />
      <RequestTrace route={route} />
      <hr className="border-border" />
      <ServiceDetail selected={selected} route={route} />
    </div>
  );
}
