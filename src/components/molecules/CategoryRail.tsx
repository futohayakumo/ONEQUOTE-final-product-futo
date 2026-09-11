"use client";

import cn from "clsx";
import { COMPONENT_CATALOG, COMPONENT_ORDER } from "@/lib/component-catalog";
import { NODES } from "@/lib/flow-data";
import type { ComponentId, NodeId } from "@/types/flow";
import { useT } from "../providers/LocaleProvider";

/**
 * The left rail. The comps draw it as a category filter; it is built as an
 * index instead, because filtering a nine-box diagram hides the one thing the
 * diagram is for — showing what talks to what. Selecting here routes the map
 * and opens the same detail panel a click on the box would.
 */
export function CategoryRail({
  selected,
  onSelect,
}: {
  selected: NodeId | null;
  onSelect: (id: NodeId | null) => void;
}) {
  const t = useT();
  const activeComponent = COMPONENT_ORDER.find(
    (id: ComponentId) => COMPONENT_CATALOG[id].nodeId === selected,
  );
  // Only 7 of the 15 nodes carry a deep dive. Selecting one of the other 8 in
  // the map used to leave this rail with nothing lit and nothing highlighted,
  // so it read as "nothing is selected" while the map, the timeline and the
  // detail panel all said otherwise.
  const orphanSelection = selected !== null && activeComponent === undefined;

  return (
    <nav aria-label={t("eng.services")} className="flex flex-col gap-1">
      <button
        type="button"
        onClick={() => onSelect(null)}
        aria-current={selected === null ? "true" : undefined}
        className={cn(
          "px-4 py-2.5 text-left type-label rounded-card transition-colors duration-150",
          selected === null
            ? "bg-tint text-crimson"
            : "text-muted hover:text-charcoal",
        )}
      >
        {t("eng.allServices")}
      </button>

      {orphanSelection ? (
        <p className="px-4 py-2.5 type-caption">
          {t("eng.rail.orphan", { label: NODES[selected].label })}
        </p>
      ) : null}

      {COMPONENT_ORDER.map((id: ComponentId) => {
        const entry = COMPONENT_CATALOG[id];
        const active = activeComponent === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onSelect(entry.nodeId)}
            aria-current={active ? "true" : undefined}
            className={cn(
              "px-4 py-2.5 text-left type-label rounded-card transition-colors duration-150",
              active
                ? "bg-tint text-crimson"
                : "text-muted hover:text-charcoal",
            )}
          >
            {entry.label}
          </button>
        );
      })}
    </nav>
  );
}
