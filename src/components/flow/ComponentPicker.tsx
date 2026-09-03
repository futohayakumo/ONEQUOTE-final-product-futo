"use client";

import cn from "clsx";
import { COMPONENT_CATALOG, COMPONENT_ORDER } from "@/lib/component-catalog";
import type { ComponentId } from "@/types/flow";
import { GridIcon } from "../icons/flow";

export function ComponentPicker({
  selected,
  onSelect,
}: {
  selected: ComponentId | null;
  onSelect: (id: ComponentId | null) => void;
}) {
  return (
    <div className="flex items-center gap-3 border border-border bg-studio p-3 rounded-sharp">
      <span className="hidden shrink-0 items-center gap-2 pl-1 pr-2 type-label sm:flex">
        <GridIcon size={18} className="text-crimson" />
        Explore components
      </span>

      <div
        role="group"
        aria-label="Inspect a platform component"
        className="flex min-w-0 flex-1 gap-2 overflow-x-auto"
      >
        {COMPONENT_ORDER.map((id) => {
          const active = selected === id;
          return (
            <button
              key={id}
              type="button"
              aria-pressed={active}
              onClick={() => onSelect(active ? null : id)}
              className={cn(
                "shrink-0 whitespace-nowrap px-3 py-2 type-caption rounded-sharp transition-colors duration-150",
                active
                  ? "border-2 border-crimson bg-tint text-charcoal"
                  : "border border-border bg-studio text-charcoal hover:border-crimson hover:text-crimson",
              )}
            >
              {COMPONENT_CATALOG[id].label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
